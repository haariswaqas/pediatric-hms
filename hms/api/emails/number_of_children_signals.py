from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from ..models import Child, ParentProfile

@receiver(post_save, sender=Child)
def update_number_of_children_on_create(sender, instance, created, **kwargs):
    if created and instance.primary_guardian:
        parent = instance.primary_guardian
        parent.number_of_children = parent.primary_children.count()
        parent.save()

@receiver(post_delete, sender=Child)
def update_number_of_children_on_delete(sender, instance, **kwargs):
    if instance.primary_guardian:
        parent = instance.primary_guardian
        parent.number_of_children = parent.primary_children.count()
        parent.save()
