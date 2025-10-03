from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from ..models import AdmissionRecord, Bed


# Add a pre_save handler to capture the previous bed ID
@receiver(pre_save, sender=AdmissionRecord)
def capture_previous_bed(sender, instance, **kwargs):
    """
    Before saving an AdmissionRecord, store the previous bed ID.
    """
    if instance.pk:  # Only for existing records (not newly created)
        try:
            # Get the current state from the database
            previous_instance = AdmissionRecord.objects.get(pk=instance.pk)
            # Store the previous bed_id
            instance._previous_bed_id = previous_instance.bed_id
        except AdmissionRecord.DoesNotExist:
            # If this is a new record, there's no previous bed
            instance._previous_bed_id = None
    else:
        # If this is a new record, there's no previous bed
        instance._previous_bed_id = None

@receiver(post_save, sender=AdmissionRecord)
def update_bed_status_on_admission(sender, instance, created, **kwargs):
    """
    When an admission record is created or updated, update bed statuses.
    """
    previous_bed_id = getattr(instance, "_previous_bed_id", None)

    # If the admission was newly created, just mark the new bed as occupied
    if created:
        if instance.bed:
            instance.bed.is_occupied = True
            instance.bed.save()
    else:
        # If the bed was changed, free up the previous one
        if previous_bed_id and previous_bed_id != instance.bed_id:
            try:
                previous_bed = Bed.objects.get(id=previous_bed_id)
                previous_bed.is_occupied = False
                previous_bed.save()
            except Bed.DoesNotExist:
                # Previous bed no longer exists, so no need to update it
                pass

        # Mark the new bed as occupied
        if instance.bed:
            instance.bed.is_occupied = True
            instance.bed.save()

    # Also handle discharge cases
    if instance.discharge_date and instance.bed:
        # If the patient has been discharged, free up the bed
        instance.bed.is_occupied = False
        instance.bed.save()

@receiver(post_save, sender=AdmissionRecord)
def update_bed_status_on_discharge(sender, instance, **kwargs):
    """
    When a patient is discharged, mark the bed as available.
    """
    if instance.discharge_date and instance.bed:
        instance.bed.is_occupied = False
        instance.bed.save()


@receiver(post_delete, sender=AdmissionRecord)
def free_up_bed_on_admission_delete(sender, instance, **kwargs):
    """
    When an admission record is deleted, free up the bed.
    """
    if instance.bed:
        instance.bed.is_occupied = False
        instance.bed.save()
