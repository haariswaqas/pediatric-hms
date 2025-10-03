from rest_framework import viewsets, status, exceptions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
#from rest_framework.filters import OrderingFilter
#from django_filters.rest_framework import DjangoFilterBackend
from ..models import Vaccine, VaccinationRecord
from ..serializers import VaccineSerializer, VaccinationRecordSerializer, ParentVaccinationReminderSerializer, MedicalProfessionalVaccinationReminderSerializer
from ..schedulers import set_vaccination_reminder_schedule, get_vaccination_reminder_schedule, get_vaccination_reminder_for_medical_professionals_schedule, set_vaccination_reminder_for_medical_professionals_schedule
from ..permissions import IsAdminUser, DynamicRolePermission, VaccinationRecordPermission
from ..scheduled_tasks import generate_vaccination_report
from .logging_views import LoggingViewSet
class VaccineViewSet(LoggingViewSet, ModelViewSet):
    """
    API endpoint that allows vaccines to be viewed or edited.
    Only Admins, Doctors, and Nurses have access.
    """
    queryset = Vaccine.objects.all()
    serializer_class = VaccineSerializer
    permission_classes = [VaccinationRecordPermission]


class VaccinationRecordViewSet(LoggingViewSet, ModelViewSet):
    """
    API endpoint for managing vaccination records.
    """
    queryset = VaccinationRecord.objects.all()
    serializer_class = VaccinationRecordSerializer
    permission_classes = [VaccinationRecordPermission]

    def get_queryset(self):
        user = self.request.user

        # Admins and medical professionals can see all
        if user.role in ['admin', 'doctor', 'nurse', 'pharmacist', 'lab_tech']:
            return VaccinationRecord.objects.all()

        # Parents only see their own children’s records
        if user.role == 'parent':
            return (
                VaccinationRecord.objects.filter(child__primary_guardian=user.parentprofile) |
                VaccinationRecord.objects.filter(child__secondary_guardian=user.parentprofile)
            )

        return VaccinationRecord.objects.none()
    
    @action(detail=False, methods=['post'], url_path='send-vaccination-report')
    def send_vaccination_report(self, request):
        """
        Trigger generation & emailing of today's appointment report.
        Only admins, doctors, and nurses may invoke this.
        """
    # Prevent parents from triggering this action
        if request.user.role == 'parent':
            return Response(
                {"detail": "You do not have permission to send the daily report."},
                status=status.HTTP_403_FORBIDDEN
            )

        # enqueue the Celery task
        generate_vaccination_report.delay()
        return Response(
            {"detail": "Vaccination report generation queued."},
            status=status.HTTP_202_ACCEPTED
        )

    def perform_create(self, serializer):
        user = self.request.user
        # only doctors/nurses may CREATE
        if user.role not in ['doctor', 'nurse']:
            raise exceptions.PermissionDenied("Only doctors or nurses may create vaccination records.")
        # serializer’s create() will attach administered_by = request.user
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        record = self.get_object()
        # only the same doctor/nurse who administered can UPDATE
        if user.role == 'doctor':
            allowed = (record.administered_by_id == user.id)
        elif user.role == 'nurse':
            allowed = (record.administered_by_id == user.id)
        else:
            allowed = False

        if not allowed:
            raise exceptions.PermissionDenied("You may only update records you administered.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        # same check as update
        if user.role not in ['doctor', 'nurse'] or instance.administered_by_id != user.id:
            raise exceptions.PermissionDenied("You may only delete records you administered.")
        instance.delete()
 # Other users get no access


# vaccination_views.py
from ..tasks import create_system_log_task
class SetParentVaccinationReminder(APIView):
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        serializer = ParentVaccinationReminderSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            try:
                set_vaccination_reminder_schedule(
                    every=data['every'],
                    period=data['period'],
                    enabled=data['enabled']
                )
                msg = f"Parent vaccination reminder schedule set to every {data['every']} {data['period']} (enabled={data['enabled']})"
                create_system_log_task.delay('info', msg, user_id=request.user.id)
                return Response(
                    {'message': 'Vaccination reminder set/updated for parents'},
                    status=status.HTTP_200_OK
                )
            except ValueError as e:
                err = str(e)
                create_system_log_task.delay('error', f"Failed to set parent vaccination reminder: {err}", user_id=request.user.id)
                return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        # validation error
        create_system_log_task.delay('warning', f"Invalid data for parent vaccination reminder: {serializer.errors}", user_id=request.user.id)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        try:
            schedule = get_vaccination_reminder_schedule()
           # create_system_log_task.delay('info', "Fetched parent vaccination reminder schedule", user_id=request.user.id)
            return Response(schedule, status=status.HTTP_200_OK)
        except ValueError as e:
            err = str(e)
           # create_system_log_task.delay('warning', f"Failed to fetch parent vaccination reminder: {err}", user_id=request.user.id)
            return Response({'error': err}, status=status.HTTP_404_NOT_FOUND)
            
 

class SetMedicalProfessionalVaccinationReminder(APIView):
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        serializer = MedicalProfessionalVaccinationReminderSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            try:
                set_vaccination_reminder_for_medical_professionals_schedule(
                    every=data['every'],
                    period=data['period'],
                    enabled=data['enabled']
                )
                return Response({'message': 'Vaccination reminder set/updated for Medical Professionals'})
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        try:
            schedule = get_vaccination_reminder_for_medical_professionals_schedule()
            return Response(schedule, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {'error': str(e)}, status=status.HTTP_404_NOT_FOUND
            )
 
                                