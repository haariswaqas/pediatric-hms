from ..models import VaccinationRecord, User
from ..tasks import create_notification_task
from celery import shared_task
from django.utils.timezone import now, timedelta

# vaccination_reminder_task.py



def format_date(date):
    return date.strftime("%d %B %Y") if date else "Unknown"

@shared_task
def send_vaccination_reminder():
    """
    Sends a reminder notification for upcoming scheduled vaccinations (next day).
    """
    print("=== VACCINATION REMINDER TASK STARTED ===")
    current_time = now()
    tomorrow = current_time.date() + timedelta(days=1)
    
    print(f"Checking for vaccinations scheduled on {tomorrow}...")
    
    # Find vaccination records scheduled for tomorrow
    vaccinations = VaccinationRecord.objects.filter(
        scheduled_date=tomorrow, status="SCHEDULED"
    )
    
    if not vaccinations.exists():
        print("No scheduled vaccinations found for tomorrow.")
        return
    
    print(f"Found {vaccinations.count()} scheduled vaccinations.")
    
    for vaccination in vaccinations:
        child = vaccination.child
        parent = getattr(child.primary_guardian, 'user', None)
        
        if not parent:
            print(f"[Warning] No parent linked to child {child.first_name} {child.last_name}. Skipping notification.")
            continue
        
        message = (
            f"📢 Vaccination Reminder!"
            f"👶 Child: {child.first_name} {child.last_name}\n"
            f"💉 Vaccine: {vaccination.vaccine.name}\n"
            f"📆 Scheduled Date: {format_date(vaccination.scheduled_date)}\n\n"
            f"Please remember to take your child for their scheduled vaccination."
        )
        
        # Send reminder notification
        create_notification_task.delay(parent.id, message)
        print(f"Reminder notification sent to parent {parent.username} for vaccination on {vaccination.scheduled_date}.")




@shared_task
def vaccination_reminder_for_medical_professionals():
    """
    Sends a reminder to doctors and nurses about the number of vaccination records scheduled for today.
    """
    print("=== VACCINATION REMINDER TASK STARTED ===")
    current_time = now()
    print(f"Running vaccination reminder task at {current_time}")

    # Get scheduled vaccination records for today
    scheduled_vaccinations = VaccinationRecord.objects.filter(
        status="SCHEDULED",
        scheduled_date=current_time.date()
    )

    total_scheduled = scheduled_vaccinations.count()
    
    if total_scheduled == 0:
        print("No scheduled vaccinations found for today.")
        return

    print(f"Found {total_scheduled} scheduled vaccinations for today.")

    # Get all doctors and nurses (assuming roles are stored in user model)
    medical_staff = User.objects.filter(role__in=["doctor", "nurse"])  # Adjust field name if different

    for staff in medical_staff:
        message = (
            f"📢 Vaccination Reminder!\n\n"
            f"🔹 You have {total_scheduled} scheduled vaccinations today.\n"
            f"📅 Date: {current_time.strftime('%d %B %Y')}\n\n"
            f"Please ensure all vaccinations are administered on time."
        )

        # Send notification
        create_notification_task.delay(staff.id, message)

        print(f"Reminder sent to {staff.username} about {total_scheduled} scheduled vaccinations.")