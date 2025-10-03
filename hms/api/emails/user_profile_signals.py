from django.db.models.signals import post_save
from django.dispatch import receiver
from ..models import (User, DoctorProfile, NurseProfile, PharmacistProfile, LabTechProfile, ParentProfile)




@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == User.DOCTOR:
            DoctorProfile.objects.create(user=instance)
        elif instance.role == User.NURSE:
            NurseProfile.objects.create(user=instance)
        elif instance.role == User.PHARMACIST:
            PharmacistProfile.objects.create(user=instance)
        elif instance.role == User.LAB_TECH:
            LabTechProfile.objects.create(user=instance)
        elif instance.role == User.PARENT:
            ParentProfile.objects.create(user=instance)
        
            


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if instance.role == User.DOCTOR and hasattr(instance, 'doctorprofile'):
        instance.doctorprofile.save()
    elif instance.role == User.NURSE and hasattr(instance, 'nurseprofile'):
        instance.nurseprofile.save()
    elif instance.role == User.PHARMACIST and hasattr(instance, 'pharmacistprofile'):
        instance.pharmacistprofile.save()
    elif instance.role == User.LAB_TECH and hasattr(instance, 'labtechprofile'):
        instance.labtechprofile.save()
    elif instance.role == User.PARENT and hasattr(instance, 'parentprofile'):
        instance.parentprofile.save()
