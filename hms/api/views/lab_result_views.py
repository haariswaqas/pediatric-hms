from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from ..models import LabResult, LabResultParameter
from ..serializers import LabResultSerializer, LabResultParameterSerializer
from ..permissions import LabResultPermission, LabResultParameterPermission 
from .utils import elastic_search
from .logging_views import LoggingViewSet
from ..scheduled_tasks import generate_lab_report
from ..documents import LabResultParameterDocument

class LabResultViewSet(LoggingViewSet, ModelViewSet):
    serializer_class = LabResultSerializer
    permission_classes = [LabResultPermission]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['admin', 'lab_tech', 'nurse']:
            return LabResult.objects.all()
        if user.role == 'doctor':
            return LabResult.objects.filter(lab_request_item__lab_request__requested_by=user.doctorprofile)
        if user.role == 'parent':
            return (
                LabResult.objects.filter(lab_request_item__lab_request__child__primary_guardian=user.parentprofile) |
                LabResult.objects.filter(lab_request_item__lab_request__child__secondary_guardian=user.parentprofile)
            )
        return LabResult.objects.none()
    
    
class LabResultParameterViewSet(LoggingViewSet, ModelViewSet):
    serializer_class = LabResultParameterSerializer
    permission_classes = [LabResultParameterPermission]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['admin', 'lab_tech', 'nurse']:
            return LabResultParameter.objects.all()
        if user.role == 'doctor':
            return LabResultParameter.objects.filter(lab_result__lab_request_item__lab_request__requested_by=user.doctorprofile)
        if user.role == 'parent':
            return (
                LabResultParameter.objects.filter(lab_result__lab_request_item__lab_request__child__primary_guardian=user.parentprofile) |
                LabResultParameter.objects.filter(lab_result__lab_request_item__lab_request__child__secondary_guardian=user.parentprofile)
            )
        return LabResultParameter.objects.none()
    
    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        return elastic_search(
            request=request,
            document_class=LabResultParameterDocument,
            search_fields=[
                "child_first_name","child_last_name",
                "doctor_first_name","doctor_last_name",
                "lab_test_name","lab_test_code"],
            serializer_class=LabResultParameterDocument,
            get_queryset_method=self.get_queryset
        )
    @action(detail=False, methods=['post'], url_path='send-lab-report')
    def send_lab_report(self, request):
        if request.user.role != 'lab_tech':
            return Response(
                {"detail": "You do not have permission to send Lab Report."},
                status=status.HTTP_403_FORBIDDEN
            )
        request_id = request.data.get("request_id")
        if not request_id:
            return Response(
                {"detail": "Missing request_id parameter."},
                status=status.HTTP_400_BAD_REQUEST
            )
        generate_lab_report.delay(request_id=request_id)
        return Response(
            {"detail": f"Lab Report generation for request_id {request_id} queued."},
            status=status.HTTP_202_ACCEPTED
        )
