from django.utils import timezone
from datetime import time
from django.db.models import Q
from django.dispatch import receiver
from django.db.models.signals import post_save

from ..models import LabRequest, Shift, LabTechShiftAssignment
from ..tasks import create_notification_task  # Async task for sending notifications


from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from ..models import LabRequest, LabRequestItem, LabTechShiftAssignment, Shift, User
from ..tasks import create_notification_task


@receiver(post_save, sender=LabRequest)
def notify_labtech_on_request(sender, instance, created, **kwargs):
    if not created:
        return  # Only act on new lab requests

    now = timezone.localtime()
    current_day = now.strftime('%A')
    current_time = now.time()

    # Step 1: Get active shifts (based on day and current time)
    active_shifts = Shift.objects.filter(
        day=current_day,
        start_time__lte=current_time,
        end_time__gte=current_time
    )

    # Step 2: Find lab techs assigned to these shifts
    active_lab_tech_ids = LabTechShiftAssignment.objects.filter(
        shifts__in=active_shifts
    ).values_list('lab_tech__user_id', flat=True).distinct()

    # Step 3: Fallback if no one is on duty — get all lab techs
    if not active_lab_tech_ids:
        active_lab_tech_ids = User.objects.filter(role='lab_tech').values_list('id', flat=True)

    # Step 4: Send notifications
    for lab_tech_user_id in active_lab_tech_ids:
        create_notification_task.delay(
            user_id=lab_tech_user_id,
            message=(
                f"A new lab request (ID: {instance.id}) has been made for {instance.child.first_name} {instance.child.last_name}.\n"
                f"Requested by Dr. {instance.requested_by.first_name} {instance.requested_by.last_name}"
            )
        )

@receiver(post_save, sender=LabRequestItem)
def notify_labtech_on_request_item(sender, instance, created, **kwargs):
    if not created:
        return  # Only act on new lab requests

    now = timezone.localtime()
    current_day = now.strftime('%A')
    current_time = now.time()

    # Step 1: Get active shifts (based on day and current time)
    active_shifts = Shift.objects.filter(
        day=current_day,
        start_time__lte=current_time,
        end_time__gte=current_time
    )

    # Step 2: Find lab techs assigned to these shifts
    active_lab_tech_ids = LabTechShiftAssignment.objects.filter(
        shifts__in=active_shifts
    ).values_list('lab_tech__user_id', flat=True).distinct()

    # Step 3: Fallback if no one is on duty — get all lab techs
    if not active_lab_tech_ids:
        active_lab_tech_ids = User.objects.filter(role='lab_tech').values_list('id', flat=True)

    # Step 4: Send notifications
    for lab_tech_user_id in active_lab_tech_ids:
        create_notification_task.delay(
            user_id=lab_tech_user_id,
            message=(
                f"{instance.lab_test.name} {(instance.lab_test.code)} lab request has been made for {instance.lab_request.child.first_name} {instance.lab_request.child.last_name}.\n"
                f"by Dr. {instance.lab_request.requested_by.first_name} {instance.lab_request.requested_by.last_name}\n"
               f"Scheduled for {instance.lab_request.scheduled_date}"

            )
        )
