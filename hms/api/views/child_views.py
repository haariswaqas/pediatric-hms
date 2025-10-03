from rest_framework import status
from rest_framework.decorators import action

from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from ..serializers import ChildSerializer, DrugBulkUploadSerializer as ChildBulkUploadSerializer
from ..permissions import IsParentOrAdmin
from ..models import Child
from .utils import CHILD_FIELD_PROCESSORS, process_excel_file_for_child
from django_elasticsearch_dsl.search import Search
from ..tasks import create_system_log_task
from rest_framework.parsers import MultiPartParser, FormParser
from .logging_views import LoggingViewSet

class ChildViewSet(LoggingViewSet, viewsets.ModelViewSet):
    """
    ViewSet to handle CRUD operations for Child data.
    Admins and non-parents can manage all children.
    Parents can only manage their own children.
    """
    queryset = Child.objects.all()
    serializer_class = ChildSerializer
    permission_classes = [IsParentOrAdmin]  # Only the IsParentOrAdmin permission is needed now

    parser_classes = [MultiPartParser, FormParser]
    def get_queryset(self):
        """
        Admins and non-parents see all children. Parents can only see their own children.
        """
        user = self.request.user
        if user.role == 'admin' or user.role != 'parent':
            return Child.objects.all()  # Admins and non-parents see all children
        
        # Parents see only children where they are primary or secondary guardians
        return Child.objects.filter(primary_guardian=user.parentprofile) | Child.objects.filter(secondary_guardian=user.parentprofile)

    def perform_create(self, serializer):
        """
        Assigns the logged-in user as the primary guardian when a parent creates a child.
        Admins can create a child without being assigned as the guardian.
        """
        if self.request.user.role != 'admin':
            serializer.save(primary_guardian=self.request.user.parentprofile)
        else:
            serializer.save()
    
    def update(self, request, *args, **kwargs):
        child = self.get_object()
        user = request.user

        # Allow admins
        if user.role == 'admin':
            return super().update(request, *args, **kwargs)

        # Allow parents if they are primary or secondary guardians
        if user.role == 'parent':
            parent_profile = user.parentprofile
            if child.primary_guardian == parent_profile or child.secondary_guardian == parent_profile:
                return super().update(request, *args, **kwargs)

        # Otherwise, deny permission
        raise PermissionDenied("You do not have permission to update this child's information.")
    

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """
        Custom search action to search for children based on the query parameter 'q'.
        This action uses Elasticsearch to perform the search.
        """
        query = request.GET.get("q", None)
        if not query:
            return Response({"error": "Query parameter 'q' is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # First step: Search with Elasticsearch
        search = Search(index="childs").query(
            "multi_match",
            query=query,
            fields=["first_name", "last_name", "primary_guardian_name"],
            type="phrase_prefix"  # This allows prefix matching
        )
        results = search.execute()
        
        # Get the IDs of matching results
        child_ids = [hit.meta.id for hit in results]
        
        # Second step: Fetch complete objects from database
        children = Child.objects.filter(id__in=child_ids).select_related('primary_guardian')
        
        # Use your full serializer to return data
        serializer = ChildSerializer(children, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='bulk-upload')
    def bulk_upload(self, request):
        # 1. Validate upload
        upload_serializer = ChildBulkUploadSerializer(data=request.data)
        upload_serializer.is_valid(raise_exception=True)
        excel_file = upload_serializer.validated_data['file']
        
        # 2. Process file using shared processors
        try:
            successes, errors = process_excel_file_for_child(
                excel_file,
                field_processors=CHILD_FIELD_PROCESSORS,
                serializer_class=ChildSerializer
            )
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # 3. Log the bulk upload activity
        user = self.request.user
        create_system_log_task.delay(
            level="INFO",
            message=f"Child bulk upload completed. Created: {len(successes)}, Errors: {len(errors)}",
            user_id=user.id if user.is_authenticated else None
        )
        
        # 4. Return summary response
        status_code = status.HTTP_201_CREATED if not errors else status.HTTP_207_MULTI_STATUS
        return Response({
            'created': len(successes), 
            'errors': errors,
            'message': f'Bulk upload completed. {len(successes)} children created, {len(errors)} errors.'
        }, status=status_code)

            
        