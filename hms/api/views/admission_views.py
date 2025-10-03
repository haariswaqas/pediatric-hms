from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework import exceptions
from django.utils import timezone
from rest_framework.decorators import action
from .utils import elastic_search
from ..models import AdmissionRecord, AdmissionVitalRecord, AdmissionVitalRecordHistory
from ..serializers import AdmissionRecordSerializer, AdmissionVitalRecordSerializer, AdmissionVitalRecordHistorySerializer
from ..permissions import AdmissionRecordPermission, AdmissionVitalRecordPermission
from ..notifications import discharge_patient_notification
from ..scheduled_tasks import send_vitals_history_report
from .logging_views import LoggingViewSet
from ..documents import AdmissionDocument
from ..scheduled_tasks import generate_admission_report
class AdmissionRecordViewSet(LoggingViewSet, viewsets.ModelViewSet):
    """API endpoint that allows admission records to be managed"""
    resource = "AdmissionRecord"
    queryset = AdmissionRecord.objects.all()
    serializer_class = AdmissionRecordSerializer
    permission_classes = [AdmissionRecordPermission]
    
    def get_queryset(self):
        user = self.request.user

        # Admins, doctors, and nurses can see all records
        if user.role in ['admin', 'doctor', 'nurse']:
            return AdmissionRecord.objects.all()
        
        # Parents can only see their child's admission records
        if user.role == 'parent':
            return AdmissionRecord.objects.filter(
                child__primary_guardian=user.parentprofile
            ) | AdmissionRecord.objects.filter(
                child__secondary_guardian=user.parentprofile
            )
        
        return AdmissionRecord.objects.none()  # Other users get no access
    
    def perform_create(self, serializer):
        
        bed = serializer.validated_data.get('bed')
        # Only allow creation if the bed is currently occupied
        if not bed.is_occupied:
            serializer.save()
        else:
            raise exceptions.ValidationError({
                'bed': 'Cannot admit to a bed that is not occupied.'
            })
    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        return elastic_search(
            request=request,
            document_class=AdmissionDocument,
            search_fields=[
                "initial_diagnosis",
                "admission_reason",
                "child_first_name",
                "child_last_name",
                "doctor_first_name",
                "doctor_last_name",
            ],
            serializer_class=AdmissionRecordSerializer,
            get_queryset_method=self.get_queryset
        )
    @action(detail=False, methods=['post'], url_path='send-admission-report')
    def send_admission_report(self, request):
        if request.user.role not in ['doctor', 'nurse']:
            return Response(
                {"detail": "You do not have permission to send the Admission Report."},
                status=status.HTTP_403_FORBIDDEN
            )
        generate_admission_report.delay()
        return Response(
            {"detail": "Admission Report generation queued."},
            status=status.HTTP_202_ACCEPTED
        )


    @action(detail=True, methods=['post'], url_path='discharge')
    def discharge_patient(self, request, pk=None):
        """Custom action to discharge a patient"""
        user = request.user
        
        # Restrict access: Only admins, doctors, and nurses can discharge
        if user.role not in ['admin', 'doctor', 'nurse']:
            return Response(
                {"detail": "You do not have permission to discharge a patient."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            admission = self.get_object()
            
            # Check if patient is already discharged
            if admission.discharge_date:
                return Response(
                    {"detail": "Patient has already been discharged."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Set discharge date to now
            admission.discharge_date = timezone.now()
            admission.save()
            # Trigger notification for the parent
            
            discharge_patient_notification(admission)

            return Response(
                {"detail": "Patient successfully discharged."},
                status=status.HTTP_200_OK
            )

        except AdmissionRecord.DoesNotExist:
            return Response(
                {"detail": "Admission record not found."},
                status=status.HTTP_404_NOT_FOUND
            )




class AdmissionVitalRecordViewSet(LoggingViewSet, viewsets.ModelViewSet):
    """
    API endpoint for managing admission vital records.
    
    - Admins, Doctors, and Nurses can create, update, and delete vital records.
    - Parents can only view the vital records for their child's admissions.
    """
    serializer_class = AdmissionVitalRecordSerializer
    permission_classes = [AdmissionVitalRecordPermission]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admins, doctors, and nurses can access all vital records.
        if user.role in ['admin', 'doctor', 'nurse']:
            return AdmissionVitalRecord.objects.all()
        
        # Parents can only view vital records for admissions of their own children.
        if user.role == 'parent':
            qs_primary = AdmissionVitalRecord.objects.filter(admission__child__primary_guardian=user.parentprofile)
            qs_secondary = AdmissionVitalRecord.objects.filter(admission__child__secondary_guardian=user.parentprofile)
            return qs_primary | qs_secondary
        
        # Others get no access.
        return AdmissionVitalRecord.objects.none()
    @action(detail=True, methods=['post'], url_path='send-history-pdf')
    def send_history_pdf(self, request, pk=None):
        """
        Custom action: generate the full vitals‐history PDF for this record
        and email it to the child’s primary guardian.
        """
        avr = self.get_object()
        # enqueue Celery task
        send_vitals_history_report.delay(avr.id)
        return Response(
            {"detail": "Vitals history PDF generation & email queued."},
            status=status.HTTP_202_ACCEPTED
        )

class AdmissionVitalRecordHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AdmissionVitalRecordHistorySerializer
    permission_classes = [AdmissionVitalRecordPermission]

    def get_queryset(self):
        user = self.request.user
        
        # Admins, doctors, and nurses can access all history records.
        if user.role in ['admin', 'doctor', 'nurse']:
            return AdmissionVitalRecordHistory.objects.all()
        
        # Parents can only view history records for their child's admissions.
        if user.role == 'parent':
            qs_primary = AdmissionVitalRecordHistory.objects.filter(
                admission_vital_record__admission__child__primary_guardian=user.parentprofile
            )
            qs_secondary = AdmissionVitalRecordHistory.objects.filter(
                admission_vital_record__admission__child__secondary_guardian=user.parentprofile
            )
            return qs_primary | qs_secondary
        
        # Others get no access.
        return AdmissionVitalRecordHistory.objects.none()
    
    