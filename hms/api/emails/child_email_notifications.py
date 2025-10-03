from django.db.models.signals import post_save, post_delete
from ..models import User, Child
from django.dispatch import receiver
from ..tasks import send_email_task
import sys

@receiver(post_save, sender=Child)
def send_child_added_email(sender, instance, created, **kwargs):
    # Avoid sending emails during migrations
    if any(cmd in sys.argv for cmd in ['makemigrations', 'migrate']):
        return

    if created and instance.primary_guardian:
        subject = "Your Child Has Been Added to the System"
        message = (
            f"Dear {instance.primary_guardian.user.username},\n\n"
            f"We are pleased to inform you that your child, {instance.first_name} {instance.last_name}, has been successfully added to the hospital system.\n\n"
            "You can now access their medical records and updates through the portal.\n\n"
            "Best regards,\nHospital Admin"
        )
        
        # Send email to primary guardian
        send_email_task.delay(subject, message, [instance.primary_guardian.user.email])
        



@receiver(post_delete, sender=Child)
def send_child_removed_email(sender, instance, **kwargs):
    # Avoid sending emails during migrations
    if any(cmd in sys.argv for cmd in ['makemigrations', 'migrate']):
        return

    if instance.primary_guardian:
        # Retrieve the first available admin's email
        admin = User.objects.filter(role=User.ADMIN).first()
        admin_email = admin.email if admin else "admin@example.com"  # Default fallback

        subject = "Your Child Has Been Removed from the System"
        message = (
            f"Dear {instance.primary_guardian.user.username},\n\n"
            f"We want to inform you that your child, {instance.first_name} {instance.last_name}, has been removed from the hospital system.\n\n"
            f"If you performed this action, no further steps are needed.\n"
            f"However, if you did not request this removal, please contact the hospital administrator immediately.\n\n"
            f"Admin Contact: {admin_email}\n\n"
            "Best regards,\nHospital Admin"
        )
        
        # Send email to primary guardian
        send_email_task.delay(subject, message, [instance.primary_guardian.user.email])
