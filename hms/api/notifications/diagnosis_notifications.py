from django.db.models.signals import post_save
from django.dispatch import receiver
from ..models import Diagnosis, DiagnosisAttachment, Treatment
from ..tasks import create_notification_task
import sys


def is_running_migrations():
    return any(cmd in sys.argv for cmd in ['makemigrations', 'migrate'])


@receiver(post_save, sender=Diagnosis)
def notify_guardian_on_diagnosis(sender, instance, created, **kwargs):
    if is_running_migrations() or not created:
        return

    child = instance.child
    guardian = getattr(child.primary_guardian, 'user', None)

    if guardian:
        message = (
            f"A new diagnosis has been added for {child.first_name}:\n"
            f"Title: {instance.title}\n"
            f"Description: {instance.description or 'No description provided.'}"
        )
        create_notification_task.delay(guardian.id, message)


@receiver(post_save, sender=DiagnosisAttachment)
def notify_guardian_on_attachment(sender, instance, created, **kwargs):
    if is_running_migrations() or not created:
        return

    child = instance.diagnosis.child
    guardian = getattr(child.primary_guardian, 'user', None)

    if guardian:
        message = (
            f"A new attachment has been added to {child.first_name}'s diagnosis '{instance.diagnosis.title}':\n"
            f"Title: {instance.title}\n"
            f"Description: {instance.description or 'No description provided.'}"
        )
        create_notification_task.delay(guardian.id, message)


@receiver(post_save, sender=Treatment)
def notify_guardian_on_treatment(sender, instance, created, **kwargs):
    if is_running_migrations() or not created:
        return

    child = instance.diagnosis.child
    guardian = getattr(child.primary_guardian, 'user', None)

    if guardian:
        message = (
            f"A new treatment has been added for {child.first_name} related to the diagnosis '{instance.diagnosis.title}':\n"
            f"Title: {instance.title}\n"
            f"Description: {instance.description or 'No description provided.'}"
        )
        create_notification_task.delay(guardian.id, message)
