import logging
from datetime import datetime
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .utils import elastic_search
from ..scheduled_tasks import generate_and_send_appointment_report, auto_complete_appointments
from ..models import Appointment, DoctorProfile, DoctorShiftAssignment, Shift, Child
from ..serializers import AppointmentSerializer
from ..documents import AppointmentDocument
from django.db import IntegrityError
from .logging_views import LoggingViewSet

logger = logging.getLogger(__name__)

class AppointmentViewSet(LoggingViewSet, viewsets.ModelViewSet):
    """
    ViewSet to handle CRUD operations for Appointment model.
    Admin can manage all appointments.
    Parents can only manage their own children's appointments.
    Doctors can manage only their own appointments.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    #filter_backends = [DjangoFilterBackend, OrderingFilter]
    #filterset_fields = ['status']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Return the queryset based on the user's role:
        - Admin => All appointments
        - Parent => Only their appointments
        - Doctor => Only appointments assigned to them
        """
        user = self.request.user
        
        if user.role == 'admin':
            return Appointment.objects.all()
        elif user.role == 'parent':
            return Appointment.objects.filter(parent=user.parentprofile)
        elif user.role == 'doctor':
            doctor_profile = get_object_or_404(DoctorProfile, user=user)
            return Appointment.objects.filter(doctor=doctor_profile)
        else:
            return Appointment.objects.none()

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """
        Confirm the appointment if it's currently 'PENDING'.
        Only admin or doctor can call this action.
        """
        if request.user.role not in ['admin', 'doctor']:
            return Response(
                {"detail": "Only admin or doctor can confirm appointments."},
                status=status.HTTP_403_FORBIDDEN
            )

        appointment = self.get_object()
        if appointment.status != 'PENDING':
            return Response(
                {"detail": "Only PENDING appointments can be confirmed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        appointment.status = 'CONFIRMED'
        appointment.save()
        logger.warning(
            f"Appointment {appointment.id} confirmed by {request.user.role} (user={request.user.id})."
        )
        return Response({"detail": "Appointment confirmed."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel the appointment if it's not already 'COMPLETED'.
        """
        appointment = self.get_object()
        if appointment.status == 'COMPLETED':
            return Response(
                {"detail": "Cannot cancel a COMPLETED appointment."},
                status=status.HTTP_400_BAD_REQUEST
            )
        appointment.status = 'CANCELLED'
        appointment.save()
        logger.warning(
            f"Appointment {appointment.id} cancelled by {request.user.role} (user={request.user.id})."
        )
        return Response({"detail": "Appointment cancelled."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def check_status(self, request, pk=None):
        """
        If the (appointment_date + appointment_time) is in the past and the status is 'CONFIRMED',
        automatically mark it as 'COMPLETED'.
        """
        appointment = self.get_object()
        now = timezone.now()

        # Combine the date & time into a single datetime
        appt_datetime = datetime.combine(
            appointment.appointment_date,
            appointment.appointment_time
        ).astimezone(timezone.get_current_timezone())

        if appointment.status == 'CONFIRMED' and appt_datetime <= now:
            appointment.status = 'COMPLETED'
            appointment.save()
            logger.warning(f"Appointment {appointment.id} auto-completed (past date).")
            return Response({"detail": "Appointment marked as COMPLETED."}, status=status.HTTP_200_OK)

        logger.warning(
            f"Appointment {appointment.id} check_status => No change. Current status: {appointment.status}"
        )
        return Response({"detail": f"Current status is {appointment.status}. No change."})
    @action(detail=False, methods=['post'], url_path='send-daily-report')
    def send_daily_report(self, request):
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
        generate_and_send_appointment_report.delay()
        return Response(
            {"detail": "Appointment report generation queued."},
            status=status.HTTP_202_ACCEPTED
        )
    @action(detail=False, methods=['post'])
    def auto_complete_all(self, request):
        """
        Trigger the background Celery task to auto‑complete all past confirmed appointments.
        """
        result = auto_complete_appointments.delay()
        return Response(
            {"detail": "Auto‑completion kicked off.", "task_id": result.id},
            status=status.HTTP_202_ACCEPTED
        )
    # elastic search action
    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        return elastic_search(
            request=request,
            document_class=AppointmentDocument,
            search_fields=["initial_diagnosis","admission_reason", "child_first_name", "child_last_name","doctor_first_name","doctor_last_name"],
            serializer_class=AppointmentSerializer,
            get_queryset_method=self.get_queryset
        )



    def create(self, request, *args, **kwargs):
        """
        Custom create method to validate that:
        1. The chosen appointment_date and appointment_time match one of the doctor's assigned shifts
        2. The parent is the guardian of the child for whom the appointment is being created
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Extract validated fields
        doctor = serializer.validated_data['doctor']
        doctor_id = doctor.id
        appt_date = serializer.validated_data['appointment_date']
        appt_time = serializer.validated_data['appointment_time']
        child = serializer.validated_data.get('child')

        # STEP 1: Validate parent-child relationship if user is a parent
        if request.user.role == 'parent' and child:
            parent_profile = request.user.parentprofile
            
            # Check if the parent is the primary or secondary guardian of the child
            if child.primary_guardian != parent_profile and (
                not hasattr(child, 'secondary_guardian') or 
                child.secondary_guardian != parent_profile
            ):
                logger.warning(
                    f"User {request.user.id} (parent) tried to create appointment for child {child.id} "
                    f"but is not a guardian of this child."
                )
                return Response(
                    {"detail": "You can only create appointments for children you are a guardian of."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            logger.warning(f"Parent-child relationship validated for user {request.user.id} and child {child.id}")

        # STEP 2: Combine date & time to check if in the past
        combined_datetime = datetime.combine(appt_date, appt_time)
        combined_datetime = combined_datetime.astimezone(timezone.get_current_timezone())

        if combined_datetime < timezone.now():
            logger.warning("Attempt to create an appointment in the past.")
            return Response(
                {"detail": "Appointment date/time cannot be in the past."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # STEP 3: Convert date to day of week & compare SHIFT day
        day_of_week = appt_date.strftime('%A')  # e.g. "Monday"

        logger.warning(
            f"Creating appointment => Doctor ID: {doctor_id}, "
            f"day_of_week: {day_of_week}, appt_time: {appt_time}"
        )

        # Debug: Log all doctor shift assignments for this doctor
        all_assignments = DoctorShiftAssignment.objects.filter(doctor_id=doctor_id)
        logger.warning(f"All assignments count for doctor {doctor_id}: {all_assignments.count()}")
        
        if all_assignments.exists():
            for assignment in all_assignments:
                shift_count = assignment.shifts.count()
                logger.warning(f"Assignment ID {assignment.id} has {shift_count} shifts")
                
                # Log each shift in the assignment
                for shift in assignment.shifts.all():
                    logger.warning(f"  - Shift: {shift.day} {shift.start_time}-{shift.end_time}")

        # Fetch SHIFT ASSIGNMENTS for this doctor - check all assignments, not just first
        doctor_shift_assignments = DoctorShiftAssignment.objects.filter(doctor_id=doctor_id)
        
        if not doctor_shift_assignments.exists():
            logger.warning("No shift assignments found for this doctor.")
            return Response(
                {"detail": "This doctor has no shift assignments. Cannot schedule."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check across all assignments if any shift matches
        matched_shift = False
        for assignment in doctor_shift_assignments:
            shifts_qs = assignment.shifts.all()
            logger.warning(f"SHIFT COUNT => {shifts_qs.count()} for assignment {assignment.id}")
            
            for shift in shifts_qs:
                logger.warning(
                    f"DEBUG SHIFT => day: '{shift.day}', "
                    f"start: {shift.start_time}, end: {shift.end_time}"
                )
                logger.warning(
                    f"DEBUG APPT => day_of_week: '{day_of_week}', appt_time: {appt_time}"
                )
                if shift.day == day_of_week:
                    if shift.start_time <= appt_time <= shift.end_time:
                        matched_shift = True
                        logger.warning(
                            f"Matched SHIFT => {shift.day} {shift.start_time}-{shift.end_time}"
                        )
                        break
            
            if matched_shift:
                break
        
        if not matched_shift:
            logger.warning(f"No matching shift found for doctor {doctor_id} at day {day_of_week}, time {appt_time}")
            return Response(
                {"detail": "No matching shift for this doctor at the chosen date/time."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # All validations passed => create the appointment
        try:
            self.perform_create(serializer)
        except IntegrityError:
            logger.warning(
                f"IntegrityError: Duplicate appointment for doctor={doctor_id}, child={child.id}, "
                f"date={appt_date}, time={appt_time}"
            )
            return Response(
                {"detail": "This appointment already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )
        logger.warning(f"Appointment created successfully for doctor {doctor_id}.")
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == 'admin':
            serializer.save()
        elif user.role == 'parent':
            serializer.save(parent=user.parentprofile)
        elif user.role == 'doctor':
            doctor_profile = get_object_or_404(DoctorProfile, user=user)
            serializer.save(doctor=doctor_profile)
        else:
            raise PermissionError("You do not have permission to create appointments.")

    def update(self, request, *args, **kwargs):
        """
        Restrict updates to owners (parent or doctor) or admin.
        Also validate child-parent relationship for parents.
        """
        instance = self.get_object()
        
        # For parent users, validate the parent-child relationship
        if request.user.role == 'parent' and 'child' in request.data:
            child_id = request.data.get('child')
            if child_id:
                try:
                    child = Child.objects.get(id=child_id)
                    parent_profile = request.user.parentprofile
                    
                    if child.primary_guardian != parent_profile and (
                        not hasattr(child, 'secondary_guardian') or 
                        child.secondary_guardian != parent_profile
                    ):
                        return Response(
                            {"detail": "You can only update appointments for children you are a guardian of."},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except Child.DoesNotExist:
                    return Response(
                        {"detail": "Child not found"},
                        status=status.HTTP_404_NOT_FOUND
                    )
        
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        Restrict partial updates similarly.
        """
        # Use the same validation logic as in update
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Restrict deletion similarly.
        """
        return super().destroy(request, *args, **kwargs)

    def get_object(self):
        """
        Ensure the user can only operate on appointments they own
        or if they are an admin or the assigned doctor.
        """
        obj = super().get_object()
        user = self.request.user

        if user.role == 'admin':
            return obj
        if user.role == 'parent':
            if obj.parent != user.parentprofile:
                raise PermissionError("You do not own this appointment.")
            return obj
        if user.role == 'doctor':
            doctor_profile = get_object_or_404(DoctorProfile, user=user)
            if obj.doctor != doctor_profile:
                raise PermissionError("You do not own this appointment.")
            return obj

        raise PermissionError("You do not have permission to access this appointment.")
    
from rest_framework.response import Response
from rest_framework import status
from ..serializers import AppointmentReminderSerializer, DoctorAppointmentReminderSerializer
from ..permissions import IsAdminUser
from rest_framework.views import APIView
from ..schedulers import (
    set_appointment_reminder_schedule,
    get_appointment_reminder_schedule,  # import the new getters
    set_doctor_appointment_reminder_schedule,
    get_doctor_appointment_reminder_schedule,
)


class SetAppointmentReminder(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = AppointmentReminderSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            try:
                set_appointment_reminder_schedule(
                    every=data['every'],
                    period=data['period'],
                    enabled=data['enabled'],
                )
                return Response(
                    {'message': 'Appointment reminder set/updated successfully'},
                    status=status.HTTP_200_OK
                )
            except ValueError as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def get(self, request):
        try:
            schedule = get_appointment_reminder_schedule()
            return Response(schedule, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {'error': str(e)}, status=status.HTTP_404_NOT_FOUND
            )


class SetDoctorAppointmentReminder(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = DoctorAppointmentReminderSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            try:
                set_doctor_appointment_reminder_schedule(
                    hour=data['hour'],
                    minute=data['minute'],
                    enabled=data['enabled'],
                )
                return Response(
                    {'message': 'Doctor appointment reminder scheduled successfully'},
                    status=status.HTTP_200_OK
                )
            except ValueError as e:
                return Response(
                    {'error': str(e)}, status=status.HTTP_400_BAD_REQUEST
                )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def get(self, request):
        try:
            schedule = get_doctor_appointment_reminder_schedule()
            return Response(schedule, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {'error': str(e)}, status=status.HTTP_404_NOT_FOUND
            )
