from rest_framework import viewsets, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import RolePermissionModel
from ..serializers import RolePermissionSerializer
from ..permissions import IsAdminUser
from django.contrib.contenttypes.models import ContentType

class RolePermissionViewSet(viewsets.ModelViewSet):
    queryset = RolePermissionModel.objects.all()
    serializer_class = RolePermissionSerializer
    permission_classes = [IsAdminUser]  # Only admin users can access

    def perform_create(self, serializer):
        content_type_id = self.request.data.get("content_type")
        if content_type_id:
            try:
                content_type = ContentType.objects.get(id=content_type_id)
                serializer.save(content_type=content_type)
            except ContentType.DoesNotExist:
                raise serializers.ValidationError("Invalid content type")
        else:
            raise serializers.ValidationError("content_type is required")

class ContentTypesView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Explicit list of models for role permission
        allowed_models = [
           'child', 'growthrecord', 'ward', 'bed',
            'shift', 'doctorshiftassignment', 'nurseshiftassignment',
            'pharmacistshiftassignment', 'labtechshiftassignment',
           'appointment',
            'vaccine', 'vaccinationrecord',
            'admissionrecord', 'admissionvitalrecord', 'admissionvitalrecordhistory',
            'diagnosis', 'diagnosisattachment', 'treatment',
            'drug', 'druginteraction', 'drugdispenserecord',
            'prescription', 'prescriptionitem', 'adversereaction'
        ]

        content_types = ContentType.objects.filter(app_label='api', model__in=allowed_models)

        data = [
            {
                "id": ct.id,
                "model": ct.model,
                "name": ct.name.title(),
                "app_label": ct.app_label
            }
            for ct in content_types
        ]
        return Response(data)