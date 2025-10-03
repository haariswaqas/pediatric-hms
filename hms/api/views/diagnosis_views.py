from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework import status
from .utils import elastic_search
from ..documents import DiagnosisDocument
import requests
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.conf import settings
from rest_framework.decorators import permission_classes, api_view
from ..models import Diagnosis, DiagnosisAttachment, Treatment
from ..serializers import DiagnosisSerializer, DiagnosisAttachmentSerializer, TreatmentSerializer
from ..permissions import IsDoctorOrReadOnly, DiagnosisPermission, IsDoctorOrLabTechOtherwiseReadOnly
from ..tasks import create_system_log_task
from ..permissions import DynamicRolePermission
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from .logging_views import LoggingViewSet



# views/icd_api.py

ICD_TOKEN_URL    = "https://icdaccessmanagement.who.int/connect/token"
ICD_SEARCH_URL   = "https://id.who.int/icd/release/11/2023-01/mms/search"

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_icd_codes(request):
    query = request.query_params.get('q')
    if not query:
        return Response({"error":"Query parameter `q` is required."}, status=400)

    try:
        # 1) get the OAuth2 token from the correct endpoint
        token_resp = requests.post(ICD_TOKEN_URL, data={
            'client_id': settings.ICD_CLIENT_ID,
            'client_secret': settings.ICD_CLIENT_SECRET,
            'grant_type': 'client_credentials',
            'scope': 'icdapi_access'
        })
        token_resp.raise_for_status()
        token = token_resp.json()['access_token']

        # 2) call the search endpoint
        icd_resp = requests.get(ICD_SEARCH_URL, headers={
            'Authorization': f'Bearer {token}',
            'Accept': 'application/json',
            # you may also need API‑Version and Accept-Language headers
            'API-Version': 'v2',
            'Accept-Language': 'en'
        }, params={'q': query})

        icd_resp.raise_for_status()
        return Response(icd_resp.json())

    except requests.exceptions.RequestException as e:
        return Response({"error": str(e)}, status=500)
class DiagnosisViewSet(LoggingViewSet, ModelViewSet):
    serializer_class = DiagnosisSerializer
    permission_classes = [IsAuthenticated, DiagnosisPermission]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'doctor':
            return Diagnosis.objects.filter(doctor=user.doctorprofile)
        if user.role == 'admin':
            return Diagnosis.objects.all()
        if user.role == 'parent' and hasattr(user, 'parentprofile'):
            return Diagnosis.objects.filter(
                child__primary_guardian=user.parentprofile
            )
        return Diagnosis.objects.none()
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'doctor':
            raise PermissionDenied("you cannot create diagnoses.")
        serializer.save()

    def update_status(self, request, pk, new_status):
        try:
            diagnosis = self.get_queryset().get(pk=pk)
            diagnosis.status = new_status
            diagnosis.save()
            return Response(
                {'detail': f'Status updated to {new_status}'},
                status=status.HTTP_200_OK
            )
        except Diagnosis.DoesNotExist:
            return Response(
                {'detail': 'Diagnosis not found or not permitted'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'], url_path='mark_active')
    def mark_active(self, request, pk=None):
        return self.update_status(request, pk, 'ACTIVE')

    @action(detail=True, methods=['post'], url_path='mark_resolved')
    def mark_resolved(self, request, pk=None):
        return self.update_status(request, pk, 'RESOLVED')

    @action(detail=True, methods=['post'], url_path='mark_chronic')
    def mark_chronic(self, request, pk=None):
        return self.update_status(request, pk, 'CHRONIC')

    @action(detail=True, methods=['post'], url_path='mark_recurrent')
    def mark_recurrent(self, request, pk=None):
        return self.update_status(request, pk, 'RECURRENT')

    @action(detail=True, methods=['post'], url_path='mark_provisional')
    def mark_provisional(self, request, pk=None):
        return self.update_status(request, pk, 'PROVISIONAL')

    @action(detail=True, methods=['post'], url_path='mark_rule_out')
    def mark_rule_out(self, request, pk=None):
        return self.update_status(request, pk, 'RULE_OUT')

    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        """
        Full-text search against the DiagnosisDocument index.
        Passes `request` into the serializer context so that
        `to_representation` can access `request.user`.
        """
        return elastic_search(
            request=request,
            document_class=DiagnosisDocument,
            search_fields=[
                "icd_code",
                "title",
                "description",
                "status",
                "severity",
                "clinical_findings",
                "notes",
                "child_first_name",
                "child_last_name",
                "doctor_first_name",
                "doctor_last_name",
            ],
            serializer_class=DiagnosisSerializer,
            serializer_context={'request': request},
            get_queryset_method=self.get_queryset
        )

    def perform_create(self, serializer):
        profile = self.request.user.doctorprofile
        instance = serializer.save(doctor=profile)
        # assuming you have a task to log creations
        from ..tasks import create_system_log_task
        create_system_log_task.delay(
            level="INFO",
            message=f"Diagnosis created for patient '{instance.child.first_name}'.",
            user_id=self.request.user.id
        )
    

class DiagnosisAttachmentViewSet(LoggingViewSet, ModelViewSet):
    queryset = DiagnosisAttachment.objects.all()
    serializer_class = DiagnosisAttachmentSerializer
    permission_classes = [IsDoctorOrLabTechOtherwiseReadOnly]

    def perform_create(self, serializer):
        instance = serializer.save()
        user = self.request.user
        create_system_log_task.delay(
            level="INFO",
            message=f"Attachment added to diagnosis ID '{instance.diagnosis.id}'.",
            user_id=user.id if user.is_authenticated else None
        )


class TreatmentViewSet(LoggingViewSet, ModelViewSet):
    queryset = Treatment.objects.all()
    serializer_class = TreatmentSerializer
    permission_classes = [IsDoctorOrReadOnly]

    def perform_create(self, serializer):
        instance = serializer.save()
        user = self.request.user
        create_system_log_task.delay(
            level="INFO",
            message=f"Treatment plan created for diagnosis ID '{instance.diagnosis.id}'.",
            user_id=user.id if user.is_authenticated else None
        )
