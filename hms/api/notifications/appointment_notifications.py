from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from ..models import Appointment, DoctorProfile
from ..tasks import create_notification_task
import sys

from celery import shared_task
from django.utils.timezone import now, timedelta

# Store the old status in the instance temporarily
@receiver(pre_save, sender=Appointment)
def cache_old_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._old_status = Appointment.objects.get(pk=instance.pk).status
        except Appointment.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None

@receiver(post_save, sender=Appointment)
def send_appointment_notification(sender, instance, created, **kwargs):
    # Skip during migrations
    if any(cmd in sys.argv for cmd in ['makemigrations', 'migrate']):
        return

    # Handle newly created appointments
    if created:
        # Doctor-booked appointment → notify the parent
        if instance.status == 'CONFIRMED':
            message = (
                f"Dr. {instance.doctor.user.username} has scheduled and confirmed an appointment for "
                f"{instance.child.first_name} {instance.child.last_name} on "
                f"{instance.appointment_date} at {instance.appointment_time}."
            )
            recipient_id = instance.child.primary_guardian.user.id
            create_notification_task.delay(recipient_id, message)
        # Parent/admin requested appointment → notify the doctor
        else:
            message = (
                f"New appointment requested by {instance.child.primary_guardian.first_name} for "
                f"{instance.child.first_name} {instance.child.last_name} on "
                f"{instance.appointment_date} at {instance.appointment_time}."
            )
            recipient_id = instance.doctor.user.id
            create_notification_task.delay(recipient_id, message)
    # Handle status updates for existing appointments
    else:
        old_status = getattr(instance, "_old_status", None)
        
        # Only send notifications when status actually changes
        if instance.status != old_status:
            if instance.status == "CANCELLED":
                message = (
                    f"Your appointment scheduled on {instance.appointment_date} at {instance.appointment_time} has been canceled."
                )
                create_notification_task.delay(instance.child.primary_guardian.user.id, message)
            elif instance.status == "CONFIRMED" and old_status != "CONFIRMED":
                message = (
                    f"Your appointment on {instance.appointment_date} at {instance.appointment_time} has been confirmed by Dr. {instance.doctor.first_name} {instance.doctor.last_name}."
                )
                create_notification_task.delay(instance.child.primary_guardian.user.id, message)