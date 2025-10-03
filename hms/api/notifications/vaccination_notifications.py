from django.db.models.signals import post_save
from django.dispatch import receiver
from ..models import VaccinationRecord, User
from ..tasks import create_notification_task
from celery import shared_task
from django.utils.timezone import now, timedelta

@receiver(post_save, sender=VaccinationRecord)
def send_vaccination_notification(sender, instance, created, **kwargs):
    """Send a notification to the parent when a vaccination record is added or updated."""

    child = instance.child
    parent = getattr(child.primary_guardian, 'user', None)  # Prevent errors if `primary_guardian` is missing

    if not parent:  # Safety check
        print(f"[Warning] No parent linked to child {child.first_name} {child.last_name}. Notification not sent.")
        return  

    vaccine_name = instance.vaccine.name
    admin_date = instance.administered_date.strftime("%d %B %Y") if instance.administered_date else "Not Administered"
    due_date = instance.scheduled_date.strftime("%d %B %Y") if instance.scheduled_date else "Unknown"
    
    # Correct status assignment
    if instance.status == "COMPLETED":
        status = "COMPLETED"
    elif instance.status == "SCHEDULED":
        status = "SCHEDULED"
    else:
        status = instance.status  # Handle any other custom statuses

    if created:
        message = (
            f"📢 New Vaccination Record!\n\n"
            f"👶 Child: {child.first_name} {child.last_name}\n"
            f"💉 Vaccine: {vaccine_name}\n"
            f"📅 Administered on: {admin_date}\n"
            f"📆 Due Date: {due_date}\n"
            f"✅ Status: {status}\n\n"
            f"Please keep track of your child's vaccinations."
        )
    else:
        message = (
            f"🔄 Vaccination Record Updated!\n\n"
            f"👶 Child: {child.first_name} {child.last_name}\n"
            f"💉 Vaccine: {vaccine_name}\n"
            f"📅 Administered on: {admin_date}\n"
            f"📆 Due Date: {due_date}\n"
            f"✅ Status: {status}\n\n"
            f"Ensure your child's vaccinations are up to date."
        )

    # Send notification using Celery task
    create_notification_task.delay(parent.id, message)
    print(f"Notification sent to parent {parent.username} for {vaccine_name} vaccination.")


