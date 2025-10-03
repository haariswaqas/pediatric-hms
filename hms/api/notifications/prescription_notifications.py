from django.db.models.signals import post_save
from django.dispatch import receiver
from ..models import Prescription, PrescriptionItem
from ..tasks import create_notification_task

@receiver(post_save, sender=Prescription)
def notify_guardian_on_prescription(sender, instance, created, **kwargs):
    if not created:
        return  # Only notify on creation
    
    child = getattr(instance, 'child', None)
    if not child and hasattr(instance, 'diagnosis'):
        child = getattr(instance.diagnosis, 'child', None)
    if not child and hasattr(instance.diagnosis, 'appointment'):
        child = getattr(instance.diagnosis.appointment, 'child', None)

    if not child:
        return  # Cannot notify without child info

    doctor = instance.doctor

    primary_guardian = getattr(child.primary_guardian, 'user', None)
    secondary_guardian = getattr(child.secondary_guardian, 'user', None)

    if primary_guardian or secondary_guardian:
        message = (
            f"A new prescription has been created for {child.first_name} {child.last_name}\n "
            f"By: Dr. {doctor.first_name} {doctor.last_name}."
        )
        if primary_guardian:
            create_notification_task.delay(primary_guardian.id, message)
        if secondary_guardian:
            create_notification_task.delay(secondary_guardian.id, message)

@receiver(post_save, sender=PrescriptionItem)
def notify_on_drug_prescription(sender, instance, created, **kwargs):
    if not created: 
        return
    child = getattr(instance.prescription, 'child', None)
    
    if not child:
        return
    doctor = instance.prescription.doctor
    drug_name = instance.drug.name
    drug_duration_value = instance.duration_value
    drug_duration_unit = instance.duration_unit
    drug_frequency = instance.get_frequency_display()
    
    primary_guardian = getattr(child.primary_guardian, 'user', None)
    secondary_guardian = getattr(child.secondary_guardian, 'user', None)
    
    if primary_guardian or secondary_guardian:
        message = (
            f"New drug prescribed by Dr. {doctor.first_name} {doctor.last_name}!\n"
            f"{drug_name} to be taken {drug_frequency} for {drug_duration_value} {drug_duration_unit}"
        )
        if primary_guardian:
            create_notification_task.delay(primary_guardian.id, message)
        if secondary_guardian:
            create_notification_task.delay(secondary_guardian.id, message)
    
    