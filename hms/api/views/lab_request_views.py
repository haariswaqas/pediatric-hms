from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from .utils import elastic_search
from ..documents import LabRequestItemDocument
from rest_framework.exceptions import PermissionDenied
from ..serializers import LabRequestSerializer, LabRequestItemSerializer
from ..models import LabRequest, LabRequestItem
from ..permissions import LabRequestPermission, LabRequestItemPermission
from ..tasks import create_system_log_task
class LabRequestViewSet(ModelViewSet):
    serializer_class = LabRequestSerializer
    permission_classes = [LabRequestPermission]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['admin', 'lab_tech', 'nurse']:
            return LabRequest.objects.all()
        if user.role == 'doctor': 
            return LabRequest.objects.filter(requested_by=user.doctorprofile)
        if user.role == 'parent':
            return (
                  LabRequest.objects.filter(child__primary_guardian=user.parentprofile) |
                LabRequest.objects.filter(child__secondary_guardian=user.parentprofile)
            )
        return LabRequest.objects.none()
    
    def perform_create(self, serializer):
        user = self.request.user
        instance = serializer.save()
        create_system_log_task.delay(
            level="INFO",
            message=f"Lab request made for '{instance.child.first_name} {instance.child.last_name}' created.",
            user_id=user.id if user.is_authenticated else None
        )




class LabRequestItemViewSet(ModelViewSet):
    serializer_class = LabRequestItemSerializer
    permission_classes = [LabRequestItemPermission]

    def get_queryset(self):
        user = self.request.user

        if user.role in ['admin', 'lab_tech', 'nurse']:
            return LabRequestItem.objects.all()
        if user.role == 'doctor':
            return LabRequestItem.objects.filter(lab_request__requested_by=user.doctorprofile)
        if user.role == 'parent':
            return (
                LabRequestItem.objects.filter(lab_request__child__primary_guardian=user.parentprofile) |
                LabRequestItem.objects.filter(lab_request__child__secondary_guardian=user.parentprofile)
            )
        return LabRequestItem.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        lab_request = serializer.validated_data.get('lab_request')

        if user.role == 'doctor':
            # Ensure the lab_request was created by the current doctor
            if lab_request.requested_by != user.doctorprofile:
                raise PermissionDenied("You are not allowed to add items to lab requests you did not create.")

        instance = serializer.save()
        create_system_log_task.delay(
            level="INFO",
            message=f"{instance.lab_test.name} ({instance.lab_test.code}) lab request made for '{instance.lab_request.child.first_name} {instance.lab_request.child.last_name}'.",
            user_id=user.id if user.is_authenticated else None
        )
        
    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        return elastic_search(
            request=request,
            document_class=LabRequestItemDocument,
            search_fields=[
                "child_first_name","child_last_name",
                "doctor_first_name","doctor_last_name",
                "lab_test_name","lab_test_code"],
            serializer_class=LabRequestItemDocument,
            get_queryset_method=self.get_queryset
        )

    
    
    
    
    
    