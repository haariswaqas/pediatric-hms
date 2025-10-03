from django.db.models.signals import post_save
from ..models import LabResult, LabResultParameter
from ..tasks import create_notification_task
from django.dispatch import receiver

@receiver(post_save, sender=LabResult)
def notify_doctor_on_lab_result(sender, instance, created, **kwargs):
    if not created:
        return
    
    doctor = getattr(instance.lab_request_item.lab_request.requested_by, 'user', None)
    child = instance.lab_request_item.lab_request.child
    primary_guardian = getattr(instance.lab_request_item.lab_request.child.primary_guardian, 'user', None)
    
    if doctor:
        message = (
            f"Lab result complete for {child.first_name} {child.last_name}\n"
            "wait for specific results..."
        )
        create_notification_task.delay(doctor.id, message)
    if primary_guardian:
        message = (
            f"Lab result complete for {child.first_name} {child.last_name}\n"
            "wait for specific results..."
        )
        create_notification_task.delay(primary_guardian.id, message)


@receiver(post_save, sender=LabResultParameter)
def notify_doctor_on_lab_result_parameter(sender, instance, created, **kwargs):
    if not created:
        return
    doctor = getattr(instance.lab_result.lab_request_item.lab_request.requested_by, 'user', None)
    child = instance.lab_result.lab_request_item.lab_request.child
    primary_guardian = getattr(instance.lab_result.lab_request_item.lab_request.child.primary_guardian, 'user', None)
    
    
    if doctor:
        message = (
            f"Lab result complete for {child.first_name} {child.last_name}\n"
            f"{instance.parameter_name} count of {instance.value} {instance.unit} is {instance.status}"
        )
        create_notification_task.delay(doctor.id, message)
    if primary_guardian:
        message = (
            f"Lab result complete for {child.first_name} {child.last_name}\n"
           f"{instance.parameter_name} count of {instance.value} {instance.unit} is {instance.status}"
        )
        create_notification_task.delay(primary_guardian.id, message)