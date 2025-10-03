from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .utils import LAB_TEST_FIELD_PROCESSORS, REFERENCE_RANGE_FIELD_PROCESSORS, process_excel_file_for_child as process_excel_file
from ..models import LabTest, ReferenceRange
from ..serializers import LabTestSerializer, ReferenceRangeSerializer, ChildBulkUploadSerializer as LabTestBulkUploadSerializer
from ..permissions import IsLabTechOrReadOnly
from ..tasks import create_system_log_task
from .logging_views import LoggingViewSet
from rest_framework.parsers import MultiPartParser, FormParser


class LabTestViewSet(LoggingViewSet, ModelViewSet):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer
    permission_classes = [IsLabTechOrReadOnly]

    def create(self, request):
        # Check if data is a list (bulk create)
        if isinstance(request.data, list):
            serializer = self.get_serializer(data=request.data, many=True)
        else:
            serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=False, methods=['post'], url_path='bulk-upload')
    def bulk_upload(self, request):
        upload_serializer = LabTestBulkUploadSerializer(data=request.data)
        upload_serializer.is_valid(raise_exception=True)
        excel_file = upload_serializer.validated_data['file']
        
        try:
            successes, errors = process_excel_file(
                excel_file,
                field_processors=LAB_TEST_FIELD_PROCESSORS,
                serializer_class=LabTestSerializer
            )
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        user = self.request.user
        create_system_log_task.delay(
            level="INFO",
            message=f"Lab tests bulk upload completed. Created: {len(successes)}, Errors: {len(errors)}",
            user_id=user.id if user.is_authenticated else None
        )
        status_code = status.HTTP_201_CREATED if not errors else status.HTTP_207_MULTI_STATUS
        return Response({
            'created': len(successes), 
            'errors': errors,
            'message': f'Bulk upload completed. {len(successes)} lab tests created, {len(errors)} errors.'
        }, status=status_code)


class ReferenceRangeViewSet(LoggingViewSet, ModelViewSet):
    queryset = ReferenceRange.objects.all()
    serializer_class = ReferenceRangeSerializer
    permission_classes = [IsLabTechOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    
    def create(self, request):
        # Check if data is a list (bulk create)
        if isinstance(request.data, list):
            serializer = self.get_serializer(data=request.data, many=True)
        else:
            serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=False, methods=['post'], url_path='bulk-upload')
    def bulk_upload(self, request):
        upload_serializer = LabTestBulkUploadSerializer(data=request.data)
        upload_serializer.is_valid(raise_exception=True)
        excel_file = upload_serializer.validated_data['file']
        
        try:
            successes, errors = process_excel_file(
                excel_file,
                field_processors=REFERENCE_RANGE_FIELD_PROCESSORS,
                serializer_class=ReferenceRangeSerializer
            )
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        user = self.request.user
        create_system_log_task.delay(
            level="INFO",
            message=f"Reference ranges bulk upload completed. Created: {len(successes)}, Errors: {len(errors)}",
            user_id=user.id if user.is_authenticated else None
        )
        status_code = status.HTTP_201_CREATED if not errors else status.HTTP_207_MULTI_STATUS
        return Response({
            'created': len(successes), 
            'errors': errors,
            'message': f'Bulk upload completed. {len(successes)} Reference ranges created, {len(errors)} errors.'
        }, status=status_code)