from django.db.models.signals import post_save
from django.dispatch import receiver
from ..models import DrugDispenseRecord
from ..tasks import create_notification_task
from ..reports.utils import get_day_with_suffix

@receiver(post_save, sender=DrugDispenseRecord)
def notify_doctor_on_drug_dispension(sender, instance, created, **kwargs):
    if not created:
        return  
    attribute = instance.prescription_item
    doctor = getattr(attribute.prescription.doctor, 'user', None)
    child = getattr(attribute.prescription, 'child', None)
    
    if not doctor:
        return
    date_obj = instance.date_dispensed
    day_with_suffix = get_day_with_suffix(date_obj.day)
    date_dispensed = date_obj.strftime(f"{day_with_suffix} %B, %Y %I:%M %p")
    drug_name = attribute.drug.name
    pharmacist_first_name = instance.pharmacist.first_name
    pharmacist_last_name = instance.pharmacist.last_name
    date_dispensed = date_dispensed
    
    if doctor:
        message = (
            f"Drug {drug_name} dispensed to patient {child.first_name} {child.last_name}\n"
            f"on {date_dispensed}"
            
        )
        create_notification_task.delay(doctor.id, message)
    
    