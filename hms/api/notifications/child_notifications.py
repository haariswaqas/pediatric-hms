from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from ..models import Child
from ..tasks import create_notification_task
import sys

@receiver(post_save, sender=Child)
def send_child_added_notification(sender, instance, created, **kwargs):
    # Avoid sending notifications during migrations
    if any(cmd in sys.argv for cmd in ['makemigrations', 'migrate']):
        return

    if created and instance.primary_guardian:
        message = (
            f"Your child, {instance.first_name} {instance.last_name}, has been successfully added to the hospital system."
        )
        create_notification_task.delay(instance.primary_guardian.user.id, message)


@receiver(post_delete, sender=Child)
def send_child_removed_notification(sender, instance, **kwargs):
    # Avoid sending notifications during migrations
    if any(cmd in sys.argv for cmd in ['makemigrations', 'migrate']):
        return

    if instance.primary_guardian:
        message = (
            f"Your child, {instance.first_name} {instance.last_name}, has been removed from the hospital system. "
            "If you did not request this, please contact the hospital administrator."
        )
        create_notification_task.delay(instance.primary_guardian.user.id, message)
