from ..models import Appointment, DoctorProfile
from ..tasks import create_notification_task
from celery import shared_task
from django.utils.timezone import now, timedelta

@shared_task
def send_appointment_reminder():
    """
    Modified for testing: Sends a reminder notification for all confirmed appointments.
    """
    print("=== REMINDER TASK STARTED ===")
    # Get current time for logging
    current_time = now()
    print(f"Running reminder task at {current_time}")
    
    # For testing - get ALL confirmed appointments instead of just tomorrow's
    appointments = Appointment.objects.filter(
        status="CONFIRMED"
    )
    
    if not appointments.exists():
        print("No confirmed appointments found in the database")
        return
    
    print(f"Found {appointments.count()} confirmed appointments")
    
    for appointment in appointments:
        parent = appointment.parent.user
        message = f"TEST REMINDER: Your appointment with Dr. {appointment.doctor.user.username} is scheduled for {appointment.appointment_date} at {appointment.appointment_time}."

        # Send notification to the parent
        create_notification_task.delay(parent.id, message)

        print(f"Test reminder notification sent to parent {parent.username} for appointment on {appointment.appointment_date}")


@shared_task()
def send_doctor_appointment_reminder_summary():
    """
    Sends a summary notification to each doctor about their confirmed and pending appointments for the day.
    """
    print("=== DOCTOR APPOINTMENT SUMMARY TASK STARTED ===")
    
    current_time = now()
    print(f"Running doctor summary task at {current_time}")

    # Get all doctors with scheduled appointments
    doctors = DoctorProfile.objects.filter(appointments__status__in=["CONFIRMED", "PENDING"]).distinct()

    if not doctors.exists():
        print("No doctors found with scheduled appointments.")
        return

    for doctor in doctors:
        # Get today's appointments (CONFIRMED and PENDING) for this doctor
        appointments_today = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=current_time.date(),
            status__in=["CONFIRMED", "PENDING"]
        )

        if not appointments_today.exists():
            print(f"No appointments found for Dr. {doctor.user.username} today.")
            continue

        # Count CONFIRMED and PENDING appointments
        confirmed_count = appointments_today.filter(status="CONFIRMED").count()
        pending_count = appointments_today.filter(status="PENDING").count()

        # Create summary message
        message = (
            # f"Hello Dr. {doctor.user.username},\n"
            f"You have {confirmed_count} confirmed and {pending_count} pending appointments for today."
        )

        # Send notification to the doctor
        create_notification_task.delay(doctor.user.id, message)
        print(f"Doctor summary sent to {doctor.user.username}")

    print("=== DOCTOR APPOINTMENT SUMMARY TASK COMPLETED ===")


