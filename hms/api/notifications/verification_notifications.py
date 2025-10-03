from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.signing import Signer
import urllib.parse
import sys

from ..models import User
from ..tasks import create_notification_task

@receiver(post_save, sender=User)
def send_welcome_notification(sender, instance, created, **kwargs):
    """
    Sends a simple in-app welcome notification for newly registered users.
    No OTP generation here—just a welcome message.
    """
    # Avoid sending notifications during migrations
    if any(cmd in sys.argv for cmd in ['makemigrations', 'migrate']):
        return

    # Skip if user is created by admin (handled in perform_create)
    if created and getattr(instance, 'created_by_admin', False):
        return

    # If it's a newly created user and not superuser
    if created and not instance.is_superuser:
        message = (
            "Welcome to our platform!\n\n"
            "We are excited to have you onboard. "
            "Feel free to explore our services and get in touch with any questions.\n\n"
            "Best regards,\nHospital Admin"
        )
        create_notification_task.delay(instance.id, message)


@receiver(post_save, sender=User)
def notify_admin_for_verification(sender, instance, created, **kwargs):
    """
    Sends an in-app notification to admins when a medical professional (non-Parent) self-registers.
    """
    if created and instance.role != User.PARENT and not instance.created_by_admin:
        # Construct a clean message for admins
        message = (
            f"A new {instance.role} has registered:\n\n"
            f"Username: {instance.username}\n"
            f"Email: {instance.email}\n\n"
            "Please verify this user to allow them to login.\n\n"
        )

        if instance.license_document:
            message += (
                "A license document was provided. "
                "You may download it from the admin panel to review before verifying.\n"
            )
        else:
            message += "No license document was provided.\n"

        # Notify all admins
        admin_users = User.objects.filter(role=User.ADMIN)
        for admin_user in admin_users:
            create_notification_task.delay(admin_user.id, message)
