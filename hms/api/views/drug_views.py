from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from django.contrib.contenttypes.models import ContentType
from rest_framework import status
import pandas as pd
from django.db import transaction
import datetime
from decimal import Decimal
from ..models import Drug, DrugInteraction, DrugDispenseRecord, BillItem
from .utils import elastic_search, DRUG_FIELD_PROCESSORS, process_excel_file
from ..serializers import DrugSerializer, DrugBulkUploadSerializer, DrugInteractionSerializer, DrugDispenseRecordSerializer
from ..permissions import IsPharmacistOrReadOnly
from ..tasks import create_system_log_task
from .logging_views import LoggingViewSet
from ..documents import DrugDocument, DrugInteractionDocument
from ..scheduled_tasks import generate_drug_dispense_report
from rest_framework.parsers import MultiPartParser, FormParser
class DrugViewSet(LoggingViewSet, ModelViewSet):
    queryset = Drug.objects.all()
    serializer_class = DrugSerializer
    permission_classes = [IsPharmacistOrReadOnly]
    
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        instance = serializer.save()
        user = self.request.user
        create_system_log_task.delay(
            level="INFO",
            message=f"Drug '{instance.name}' created.",
            user_id=user.id if user.is_authenticated else None
        )

    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        return elastic_search(
            request=request,
            document_class=DrugDocument,
            search_fields=["name","generic_name","brand_name","description","category","dosage_form","manufacturer"],
            serializer_class=DrugSerializer,
            get_queryset_method=self.get_queryset
        )
    @action(detail=False, methods=['post'], url_path='bulk-upload')
    def bulk_upload(self, request, *args, **kwargs):
        # 1. Validate upload
        upload_serializer = DrugBulkUploadSerializer(data=request.data)
        upload_serializer.is_valid(raise_exception=True)
        excel_file = upload_serializer.validated_data['file']

        # 2. Process file using shared processors
        try:
            successes, errors = process_excel_file(
                excel_file,
                field_processors=DRUG_FIELD_PROCESSORS,
                serializer_class=DrugSerializer
            )
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Return summary response
        status_code = status.HTTP_201_CREATED if not errors else status.HTTP_207_MULTI_STATUS
        return Response({'created': len(successes), 'errors': errors}, status=status_code)
class DrugInteractionViewSet(LoggingViewSet, ModelViewSet):
    queryset = DrugInteraction.objects.all()
    serializer_class = DrugInteractionSerializer
    permission_classes = [IsPharmacistOrReadOnly]

    def perform_create(self, serializer):
        instance = serializer.save()
        user = self.request.user
        create_system_log_task.delay(
            level="INFO",
            message=f"Drug interaction '{instance}' created.",
            user_id=user.id if user.is_authenticated else None
        )

    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        query = request.query_params.get("q", "")
        if not query:
            return Response({"error": "Please provide a search query using the 'q' parameter."}, status=status.HTTP_400_BAD_REQUEST)

        # Elasticsearch query for searching Drug Interaction
        search = DrugInteractionDocument.search().query(
            "multi_match", query=query, fields=[
                "drug_one_name",  # Searching by drug names
                "drug_two_name",
                "severity",
                "description",
                "alternative_suggestion"
            ],  type="phrase_prefix" 
        )

        results = search.execute()
        interactions = [hit.to_dict() for hit in results]

        return Response(interactions)
    
    

class DrugDispenseRecordViewSet(LoggingViewSet, ModelViewSet):
    queryset = DrugDispenseRecord.objects.all()
    serializer_class = DrugDispenseRecordSerializer
    permission_classes = [IsPharmacistOrReadOnly]

    def perform_create(self, serializer):
        # 1) Get the prescription_item
        prescription_item = serializer.validated_data['prescription_item']

        # 2) Find the corresponding BillItem
        ct = ContentType.objects.get_for_model(prescription_item)
        try:
            bill_item = BillItem.objects.get(
                content_type=ct,
                object_id=prescription_item.id
            )
        except BillItem.DoesNotExist:
            raise PermissionDenied("No billing record found for this prescription item.")

        bill = bill_item.bill

        # 3) Check at least half the total has been paid
        half_total = bill.total_amount / Decimal('2.0')
        if bill.amount_paid < half_total:
            # Log warning
            create_system_log_task.delay(
                level="WARNING",
                message=(
                    f"Attempt to dispense '{prescription_item.drug.name}' "
                    f"for prescription #{prescription_item.id} blocked: "
                    f"only ${bill.amount_paid} paid, need at least ${half_total}."
                ),
                user_id=self.request.user.id if self.request.user.is_authenticated else None
            )
            # Deny
            raise PermissionDenied(
                f"Cannot dispense: at least half the bill (${half_total}) "
                f"must be paid first. Currently paid: ${bill.amount_paid}."
            )

        # 4) All good — save the record
        pharmacist = self.request.user.pharmacistprofile
        instance = serializer.save(pharmacist=pharmacist)

        # 5) Log success
        create_system_log_task.delay(
            level="INFO",
            message=(
                f"Dispensed {instance.quantity_dispensed} of "
                f"{prescription_item.drug.name} for patient "
                f"{prescription_item.prescription.child.first_name}."
            ),
            user_id=self.request.user.id if self.request.user.is_authenticated else None
        )

    @action(detail=False, methods=['post'], url_path='send-drug-dispense-report')
    def send_drug_dispense_report(self, request):
        if request.user.role != 'pharmacist':
            return Response(
                {"detail": "You do not have permission to send this report."},
                status=status.HTTP_403_FORBIDDEN
            )
        generate_drug_dispense_report.delay()
        return Response(
            {"detail": "Drug Dispense report generation queued."},
            status=status.HTTP_202_ACCEPTED
        )