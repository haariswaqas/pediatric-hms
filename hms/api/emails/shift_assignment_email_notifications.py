from django.db.models.signals import m2m_changed, pre_delete, pre_save
from django.dispatch import receiver
from django.conf import settings
from api.tasks import send_email_task
from api.models import DoctorShiftAssignment, NurseShiftAssignment, PharmacistShiftAssignment, LabTechShiftAssignment

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
def send_shift_change_email(sender, instance, action, reverse, pk_set, **kwargs):
    """
    Sends an email when shifts are assigned, removed, or changed.
    """
    role_field = role_field_mapping.get(instance.__class__.__name__)
    if not role_field:
        return

    medical_professional = getattr(instance, role_field, None)
    if not medical_professional or not medical_professional.user.email:
        return

    shifts = instance.shifts.filter(id__in=pk_set)  # Only affected shifts

    if action == "post_add" and shifts.exists():
        subject = "New Shift Assignment Notification"
        message = f"Dear {medical_professional.first_name} {medical_professional.last_name},\n\n"
        message += "You have been assigned the following new shifts:\n\n"

        for shift in shifts:
            message += f"- {shift.day}: {shift.start_time.strftime('%H:%M')} to {shift.end_time.strftime('%H:%M')}\n"

        message += "\nPlease check your schedule for more details.\n\nBest Regards,\nHospital Management System"

        send_email_task.delay(subject, message, [medical_professional.user.email])

    elif action == "post_remove" and shifts.exists():
        subject = "Shift Removal Notification"
        message = f"Dear {medical_professional.user.first_name},\n\n"
        message += "The following shifts have been removed from your schedule:\n\n"

        for shift in shifts:
            message += f"- {shift.day}: {shift.start_time.strftime('%H:%M')} to {shift.end_time.strftime('%H:%M')}\n"

        message += "\nPlease check your schedule for any updates.\n\nBest Regards,\nHospital Management System"

        send_email_task.delay(subject, message, [medical_professional.user.email])


@receiver(pre_save, sender=DoctorShiftAssignment)
@receiver(pre_save, sender=NurseShiftAssignment)
@receiver(pre_save, sender=PharmacistShiftAssignment)
@receiver(pre_save, sender=LabTechShiftAssignment)
def track_shift_changes(sender, instance, **kwargs):
    """
    Detects changes in assigned shifts and triggers an email.
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
            if not medical_professional or not medical_professional.user.email:
                return

            if added_shifts:
                subject = "Shift Update Notification"
                message = f"Dear {medical_professional.user.first_name},\n\n"
                message += "You have been assigned the following new shifts:\n\n"

                for shift in instance.shifts.filter(id__in=added_shifts):
                    message += f"- {shift.day}: {shift.start_time.strftime('%H:%M')} to {shift.end_time.strftime('%H:%M')}\n"

                message += "\nPlease check your schedule for more details.\n\nBest Regards,\nHospital Management System"

                send_email_task.delay(subject, message, [medical_professional.user.email])

            if removed_shifts:
                subject = "Shift Removal Notification"
                message = f"Dear {medical_professional.user.first_name},\n\n"
                message += "The following shifts have been removed from your schedule:\n\n"

                for shift in old_instance.shifts.filter(id__in=removed_shifts):
                    message += f"- {shift.day}: {shift.start_time.strftime('%H:%M')} to {shift.end_time.strftime('%H:%M')}\n"

                message += "\nPlease check your schedule for any updates.\n\nBest Regards,\nHospital Management System"

                send_email_task.delay(subject, message, [medical_professional.user.email])

        except sender.DoesNotExist:
            pass  # First-time save, no old shifts to compare


@receiver(pre_delete, sender=DoctorShiftAssignment)
@receiver(pre_delete, sender=NurseShiftAssignment)
@receiver(pre_delete, sender=PharmacistShiftAssignment)
@receiver(pre_delete, sender=LabTechShiftAssignment)
def send_shift_deletion_email(sender, instance, **kwargs):
    """
    Sends an email when an entire shift assignment is deleted.
    """
    role_field = role_field_mapping.get(instance.__class__.__name__)
    if not role_field:
        return

    medical_professional = getattr(instance, role_field, None)
    if not medical_professional or not medical_professional.user.email:
        return

    shifts = instance.shifts.all()

    if shifts.exists():
        subject = "Shift Assignment Deletion Notification"
        message = f"Dear {medical_professional.user.first_name},\n\n"
        message += "Your shift assignment has been completely removed. The following shifts are no longer assigned to you:\n\n"

        for shift in shifts:
            message += f"- {shift.day}: {shift.start_time.strftime('%H:%M')} to {shift.end_time.strftime('%H:%M')}\n"

        message += "\nIf you believe this is a mistake, please contact the hospital administration.\n\nBest Regards,\nHospital Management System"

        send_email_task.delay(subject, message, [medical_professional.user.email])

