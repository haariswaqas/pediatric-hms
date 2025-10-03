from django.utils.timezone import now
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from ..models import AdmissionRecord, AdmissionVitalRecordHistory
from ..tasks import create_notification_task  # Import the Celery task

def notify_parent(child, message):
    """Helper function to send notifications asynchronously via Celery."""
    guardians = [child.primary_guardian, child.secondary_guardian]
    for guardian in guardians:
        if guardian and guardian.user:
            create_notification_task.delay(guardian.user.id, message)  # Asynchronous task

@receiver(post_save, sender=AdmissionRecord)
def admission_record_saved(sender, instance, created, **kwargs):
    """Send notification when admission record is created or updated."""
    if created:
        message = f"{instance.child.first_name} {instance.child.last_name} has been admitted on {instance.admission_date.strftime('%Y-%m-%d')}."
        notify_parent(instance.child, message)
    else:
        # Check if the discharge_date was changed in this update
        if instance.discharge_date and not sender.objects.filter(pk=instance.pk, discharge_date__isnull=True).exists():
            # If discharge_date was updated, do NOT send a notification here (handled elsewhere)
            return
        
        # Otherwise, send an update notification
        message = f"{instance.child.first_name} {instance.child.last_name}'s admission details have been updated."
        notify_parent(instance.child, message)

@receiver(post_delete, sender=AdmissionRecord)
def admission_record_deleted(sender, instance, **kwargs):
    """Send notification when admission record is deleted."""
    message = f"Your child's admission record has been removed."
    notify_parent(instance.child, message)

def discharge_patient_notification(admission):
    """Send notification when a child is discharged."""
    message = f"Your child, {admission.child}, has been discharged on {now().strftime('%Y-%m-%d')}."
    notify_parent(admission.child, message)


@receiver(post_save, sender=AdmissionVitalRecordHistory)
def notify_doctor_on_rapid_vital_change(sender, instance, created, **kwargs):
    if not created:
        return

    # Retrieve the AdmissionRecord from the related AdmissionVitalRecord
    admission_record = instance.admission_vital_record.admission
    patient = admission_record.child

    # Determine who updated the record: could be a nurse or a doctor.
    updater_role = "Unknown"
    updater_first_name = "Unknown"
    updater_last_name = ""
    if instance.updated_by:
        # Check if the updated_by user has a nurse profile first
        if hasattr(instance.updated_by, 'nurseprofile'):
            updater_role = "Nurse"
            updater_first_name = instance.updated_by.nurseprofile.first_name
            updater_last_name = instance.updated_by.nurseprofile.last_name
        # Otherwise check for a doctor profile
        elif hasattr(instance.updated_by, 'doctorprofile'):
            updater_role = "Doctor"
            updater_first_name = instance.updated_by.doctorprofile.first_name
            updater_last_name = instance.updated_by.doctorprofile.last_name

    attending_doctor = admission_record.attending_doctor
    parent = admission_record.child.primary_guardian
    if not attending_doctor or not attending_doctor.user:
        return

    # Get previous history records (excluding the current one)
    previous_history_qs = instance.admission_vital_record.history.exclude(pk=instance.pk).order_by('-updated_at')
    if not previous_history_qs.exists():
        return

    previous_record = previous_history_qs.first()

    # Calculate differences between the current update and the previous record
    temp_diff = abs(instance.temperature - previous_record.temperature) if instance.temperature and previous_record.temperature else 0
    hr_diff = abs(instance.heart_rate - previous_record.heart_rate) if instance.heart_rate and previous_record.heart_rate else 0
    rr_diff = abs(instance.respiratory_rate - previous_record.respiratory_rate) if instance.respiratory_rate and previous_record.respiratory_rate else 0
    o2_diff = abs(instance.oxygen_saturation - previous_record.oxygen_saturation) if instance.oxygen_saturation and previous_record.oxygen_saturation else 0
    head_diff = abs(instance.head_circumference - previous_record.head_circumference) if instance.head_circumference and previous_record.head_circumference else 0
    cap_refill_diff = abs(instance.capillary_refill - previous_record.capillary_refill) if instance.capillary_refill and previous_record.capillary_refill else 0
    pain_diff = abs(instance.pain_score - previous_record.pain_score) if instance.pain_score and previous_record.pain_score else 0
    glucose_diff = abs(instance.glucose_level - previous_record.glucose_level) if instance.glucose_level and previous_record.glucose_level else 0

    # Define threshold values for significant changes
    TEMP_THRESHOLD = 1.0         # °C
    HR_THRESHOLD = 15            # bpm
    RR_THRESHOLD = 5             # breaths per minute
    O2_THRESHOLD = 5             # percentage points
    HEAD_THRESHOLD = 1.0         # cm
    CAP_REFILL_THRESHOLD = 1.0   # seconds
    PAIN_THRESHOLD = 2           # points
    GLUCOSE_THRESHOLD = 20       # mg/dL

    changes = []
    if temp_diff >= TEMP_THRESHOLD:
        changes.append(f"Temperature changed by {temp_diff:.1f}°C")
    if hr_diff >= HR_THRESHOLD:
        changes.append(f"Heart rate changed by {hr_diff} bpm")
    if rr_diff >= RR_THRESHOLD:
        changes.append(f"Respiratory rate changed by {rr_diff} bpm")
    if o2_diff >= O2_THRESHOLD:
        changes.append(f"Oxygen saturation changed by {o2_diff}%")
    if head_diff >= HEAD_THRESHOLD:
        changes.append(f"Head circumference changed by {head_diff} cm")
    if cap_refill_diff >= CAP_REFILL_THRESHOLD:
        changes.append(f"Capillary refill changed by {cap_refill_diff} seconds")
    if pain_diff >= PAIN_THRESHOLD:
        changes.append(f"Pain score changed by {pain_diff} points")
    if glucose_diff >= GLUCOSE_THRESHOLD:
        changes.append(f"Glucose level changed by {glucose_diff} mg/dL")

    if changes:
        message_for_attending_doctor = (
            f"Rapid change in patient vitals detected for {patient.first_name} {patient.last_name}:\n"
            f"{', '.join(changes)}.\n"
            f"Recorded by {updater_role} {updater_first_name} {updater_last_name}. Please review the patient's condition immediately."
        )
        
        message_for_parent = (
            f"Your Child's vitals have changed rapidly!"
        )
        # Send the notification to the attending doctor
        create_notification_task.delay(attending_doctor.user.id, message_for_attending_doctor)
        create_notification_task.delay(parent.user.id, message_for_parent)