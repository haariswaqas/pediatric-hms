# admissions/api/views.py
from rest_framework import viewsets, permissions
from ..permissions import IsAdminUser, IsMedicalProfessionalUser
from ..models import Report
from ..serializers import ReportSerializer
from .logging_views import LoggingViewSet
class ReportViewSet(LoggingViewSet, viewsets.ReadOnlyModelViewSet):
    queryset = Report.objects.all().order_by('-created_at')
    serializer_class = ReportSerializer
    permission_classes = [IsAdminUser | IsMedicalProfessionalUser]

    def get_queryset(self):
        user = self.request.user
        # admins see all
        if user.role == 'admin':
            return super().get_queryset()
        # other users only see reports they were granted
        return Report.objects.filter(users=user)
