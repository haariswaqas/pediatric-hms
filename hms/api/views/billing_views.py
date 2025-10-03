from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from ..models import Bill, BillItem
from ..serializers import BillSerializer, BillItemSerializer 
from ..permissions import IsAdminUser, BillPermission
from django.contrib.contenttypes.models import ContentType
from ..scheduled_tasks import generate_bill_by_bill_number
from django.http import FileResponse
import io
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from .logging_views import LoggingViewSet

class BillViewSet(LoggingViewSet, viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    permission_classes = [BillPermission]

    def get_queryset(self):
        user = self.request.user

        # Admins see all bills
        if user.role == 'admin':
            return super().get_queryset()

        # Parents only see bills for their own children
        if user.role == 'parent' and hasattr(user, 'parentprofile'):
            return super().get_queryset().filter(
                child__primary_guardian=user.parentprofile
            )

        # Any other role sees nothing
        return super().get_queryset().none()

    @action(detail=False, methods=['post'], url_path='send-bill')
    def send_bill(self, request):
        """Queue bill PDF generation and email for a given bill_number (admin only)."""
        if request.user.role != 'admin':
            return Response(
                {"detail": "You do not have permission to send bills."},
                status=status.HTTP_403_FORBIDDEN
            )

        bill_number = request.data.get("bill_number")
        if not bill_number:
            return Response(
                {"detail": "Missing 'bill_number' parameter."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Trigger Celery task
        generate_bill_by_bill_number.delay(bill_number=bill_number)

        return Response(
            {"detail": f"Bill generation for bill_number {bill_number} queued."},
            status=status.HTTP_202_ACCEPTED
        )


class BillItemViewSet(LoggingViewSet, ModelViewSet):
    queryset = BillItem.objects.all()
    serializer_class = BillItemSerializer
    permission_classes = [BillPermission]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return super().get_queryset()
        if user.role == 'parent' and hasattr(user, 'parentprofile'):
            return super().get_queryset().filter(
                bill__child__primary_guardian=user.parentprofile
            )
        return super().get_queryset().none()
    
    

# at this stage, i abandoned the use of the existing code for pdf generation because it became more complicated for this particular purpose,
# i might reuse that code for another purpose though


class ContentTypesView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Explicit list of models for role permission
        allowed_models = ['prescriptionitem', 'appointment', 'labrequestitem']

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