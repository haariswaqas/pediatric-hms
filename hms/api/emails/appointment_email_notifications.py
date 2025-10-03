from django.db.models.signals import post_save
from django.dispatch import receiver
from ..models import Appointment
from ..tasks import send_email_task
import sys

@receiver(post_save, sender=Appointment)
def send_appointment_email(sender, instance, created, **kwargs):
    # skip during migrations
    if any(cmd in sys.argv for cmd in ['makemigrations', 'migrate']):
        return

    # only on creation
    if not created:
        return

    #–– doctor‑booked appointment (already CONFIRMED) → alert the parent
    if instance.status == 'CONFIRMED':
        subject = "Your Appointment Is Confirmed"
        message = (
            f"Dear {instance.child.primary_guardian.first_name},\n\n"
            f"Dr. {instance.doctor.user.username} has scheduled and confirmed an appointment for your child "
            f"{instance.child.first_name} {instance.child.last_name}.\n\n"
            f"Date:  {instance.appointment_date}\n"
            f"Time:  {instance.appointment_time}\n\n"
            "We look forward to seeing you then.\n\n"
            "— The Clinic Team"
        )
        recipient = instance.child.primary_guardian.user.email

    #–– everything else (admin/parent requested) → notify the doctor
    else:
        subject   = "New Appointment Requested"
        message   = (
            f"Dear Dr. {instance.doctor.user.username},\n\n"
            f"An appointment has been requested by {instance.child.primary_guardian.first_name} "
            f"for {instance.child.first_name} {instance.child.last_name}.\n\n"
            f"Date: {instance.appointment_date}\n"
            f"Time: {instance.appointment_time}\n\n"
            "Please review and confirm the appointment in the system.\n\n"
            "Best regards,\nHospital Admin"
        )
        recipient = instance.doctor.user.email

    # fire the email
    send_email_task.delay(subject, message, [recipient])



@receiver(post_save, sender=Appointment)
def send_appointment_status_email(sender, instance, **kwargs):
    # Avoid sending emails during migrations
    if any(cmd in sys.argv for cmd in ['makemigrations', 'migrate']):
        return

    if instance.status == 'CANCELLED':
        subject = "Appointment Canceled"
        message = (
            f"Dear {instance.child.primary_guardian.first_name},\n\n"
            f"We regret to inform you that your appointment scheduled on {instance.appointment_date} at {instance.appointment_time} has been canceled.\n\n"
            "Please contact the hospital if you need to reschedule.\n\n"
            "Best regards,\nHospital Admin"
        )
    elif instance.status == 'CONFIRMED':
        subject = "Appointment Confirmed"
        message = (
            f"Dear {instance.child.primary_guardian.first_name},\n\n"
            f"Your appointment on {instance.appointment_date} at {instance.appointment_time} has been confirmed by Dr. {instance.doctor.user.username}.\n\n"
            "Please arrive on time and contact the hospital if you need any changes.\n\n"
            "Best regards,\nHospital Admin"
        )
    else:
        return  # No email needed for other statuses

    # Send email to the parent
    send_email_task.delay(subject, message, [instance.child.primary_guardian.user.email])
