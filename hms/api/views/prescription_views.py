from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from .utils import elastic_search
from ..documents import PrescriptionItemDocument
from rest_framework.exceptions import PermissionDenied
from ..permissions import PrescriptionItemPermission, PrescriptionPermission
from ..models import Prescription, PrescriptionItem
from ..serializers import PrescriptionSerializer, PrescriptionItemSerializer
from ..scheduled_tasks import auto_expire_prescriptions,auto_complete_prescriptions, generate_prescription_report, generate_prescription_spreadsheet
from .logging_views import LoggingViewSet
class PrescriptionViewSet(LoggingViewSet, ModelViewSet):
  
    serializer_class = PrescriptionSerializer
    permission_classes = [PrescriptionPermission]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'doctor':
            return Prescription.objects.filter(doctor=user.doctorprofile)
        elif user.role == 'parent': 
            if hasattr(user, 'parentprofile'):
                return Prescription.objects.filter(child__primary_guardian=user.parentprofile)
            return Prescription.objects.none()
    @action(detail=False, methods=['post'])
    def auto_expire_all(self, request):
        result = auto_expire_prescriptions.delay()
        return Response(
            {"detail": "auto-expiration kicked off", "task_id": result.id}, 
            status=status.HTTP_202_ACCEPTED
        )
    @action(detail=False, methods=['post'])
    def auto_complete_all(self, request):
        result = auto_complete_prescriptions.delay()
        return Response(
            {"detail": "auto-completion kicked off", "task_id": result.id}, 
            status=status.HTTP_202_ACCEPTED
        )

class PrescriptionItemViewSet(LoggingViewSet, ModelViewSet):
    queryset = PrescriptionItem.objects.all()
    serializer_class = PrescriptionItemSerializer
    permission_classes = [PrescriptionItemPermission]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'doctor':
            return PrescriptionItem.objects.filter(prescription__doctor=user.doctorprofile)
        elif user.role in ['pharmacist', 'admin', 'nurse']:
            return PrescriptionItem.objects.all()
        elif user.role == 'parent':
            if hasattr(user, 'parentprofile'):
                return PrescriptionItem.objects.filter(prescription__child__primary_guardian=user.parentprofile)
            return PrescriptionItem.objects.none()
    
    def perform_create(self, serializer):
        user = self.request.user
        prescription = serializer.validated_data['prescription']

        if user.role == 'doctor':
            if prescription.doctor != user.doctorprofile:
                raise PermissionDenied("You are not allowed to add items to a prescription you did not create.")
        
        serializer.save()

        
    @action(detail=False, methods=['post'], url_path='send-prescription-report')
    def send_prescription_report(self, request):
        if request.user.role != 'pharmacist':
            return Response(
                {"detail": "You do not have permission to send the daily report."},
                status=status.HTTP_403_FORBIDDEN
            )
        generate_prescription_report.delay()
        return Response(
            {"detail": "Prescription report generation queued."},
            status=status.HTTP_202_ACCEPTED
        )
    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        return elastic_search(
            request=request,
            document_class=PrescriptionItemDocument,
            search_fields=[
                "child_first_name",
                "child_last_name",
                "doctor_first_name",
                "doctor_last_name",
                "drug_brand_name",
                "drug_generic_name", 
                "drug_name",
                "drug_category", 
                "prescription_status"

            ],
            serializer_class=PrescriptionItemSerializer,
            get_queryset_method=self.get_queryset
        )

    
    @action(detail=False, methods=['post'], url_path='send-prescription-spreadsheet')
    def send_prescription_spreadsheet(self, request):
        if request.user.role != 'pharmacist':
            return Response(
                {"detail": "You do not have permission to send the prescription spreadsheet."},
                status=status.HTTP_403_FORBIDDEN
            )
        generate_prescription_spreadsheet.delay()
        return Response(
            {"detail": "Prescription spreadsheet generation queued."},
            status=status.HTTP_202_ACCEPTED
        )