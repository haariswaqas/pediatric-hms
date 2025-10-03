from django.db.models.signals import pre_save, m2m_changed, pre_delete
from django.dispatch import receiver
from ..models import DoctorShiftAssignment, NurseShiftAssignment, PharmacistShiftAssignment, LabTechShiftAssignment, Notification
from ..tasks import create_notification_task

role_field_mapping = {
    'DoctorShiftAssignment': 'doctor',
    'NurseShiftAssignment': 'nurse',
    'PharmacistShiftAssignment': 'pharmacist',
    'LabTechShiftAssignment': 'lab_tech'
}


@receiver(m2m_changed, sender=DoctorShiftAssignment.shifts.through)
@receiver(m2m_changed, sender=NurseShiftAssignment.shifts.through)
@receiver(m2m_changed, sender=PharmacistShiftAssignment.shifts.through)
@receiver(m2m_changed, sender=LabTechShiftAssignment.shifts.through)
def notify_new_shift_assignment(sender, instance, action, **kwargs):
    """
    Sends a notification when a shift is added via a ManyToMany relationship.
    """
    if action in ["post_add"]:  # Trigger only when new shifts are added
        role_field = role_field_mapping.get(instance.__class__.__name__)
        if not role_field:
            return
        
        medical_professional = getattr(instance, role_field, None)
        if not medical_professional or not medical_professional.user:
            return

        message = "You have been assigned the following shifts:\n"
        for shift in instance.shifts.all():
            message += f"- {shift.day}: {shift.start_time.strftime('%H:%M')} to {shift.end_time.strftime('%H:%M')}\n"

        create_notification_task.delay(medical_professional.user.id, message)

@receiver(pre_save, sender=DoctorShiftAssignment)
@receiver(pre_save, sender=NurseShiftAssignment)
@receiver(pre_save, sender=PharmacistShiftAssignment)
@receiver(pre_save, sender=LabTechShiftAssignment)
def track_shift_changes(sender, instance, **kwargs):
    """
    Detects changes in assigned shifts and triggers notifications.
    """
    if instance.pk:  # Ensure it's an update, not a new entry
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            old_shifts = set(old_instance.shifts.values_list('id', flat=True))
            new_shifts = set(instance.shifts.values_list('id', flat=True))

            removed_shifts = old_shifts - new_shifts
            added_shifts = new_shifts - old_shifts

            role_field = role_field_mapping.get(instance.__class__.__name__)
            if not role_field:
                return

            medical_professional = getattr(instance, role_field, None)
            if not medical_professional or not medical_professional.user:
                return

            if added_shifts:
                message = "You have been assigned new shifts:\n"
                for shift in instance.shifts.filter(id__in=added_shifts):
                    message += f"- {shift.day}: {shift.start_time.strftime('%H:%M')} to {shift.end_time.strftime('%H:%M')}\n"

                create_notification_task.delay(medical_professional.user.id, message)

            if removed_shifts:
                message = "The following shifts have been removed from your schedule:\n"
                for shift in old_instance.shifts.filter(id__in=removed_shifts):
                    message += f"- {shift.day}: {shift.start_time.strftime('%H:%M')} to {shift.end_time.strftime('%H:%M')}\n"

                create_notification_task.delay(medical_professional.user.id, message)


        except sender.DoesNotExist:
            pass  # First-time save, no old shifts to compare


@receiver(pre_delete, sender=DoctorShiftAssignment)
@receiver(pre_delete, sender=NurseShiftAssignment)
@receiver(pre_delete, sender=PharmacistShiftAssignment)
@receiver(pre_delete, sender=LabTechShiftAssignment)
def notify_shift_deleted(sender, instance, **kwargs):
    """
    Creates a notification when a shift assignment is deleted.
    """
    role_field = role_field_mapping.get(instance.__class__.__name__)
    if not role_field:
        return

    medical_professional = getattr(instance, role_field, None)
    if not medical_professional or not medical_professional.user:
        return

    message = "Your shift assignment has been removed."

    create_notification_task.delay(medical_professional.user.id, message)