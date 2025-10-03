from django.db import models
from .auth_models import User
from datetime import date


class BaseProfile(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=50, null=True, blank=True)
    middle_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    age = models.PositiveIntegerField(blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.date_of_birth:
            today = date.today()
            self.age = today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        super().save(*args, **kwargs)

    class Meta:
        abstract = True


class DoctorProfile(BaseProfile):
    specialization = models.CharField(max_length=100, blank=True, null=True)
    years_of_experience = models.PositiveIntegerField(blank=True, null=True)
    medical_license_number = models.CharField(max_length=100, blank=True, null=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    
    def __str__(self):
        return f"Dr. #{self.user.doctorprofile.id} {self.user.username} -{self.user.email}"



class NurseProfile(BaseProfile):
    nursing_license_number = models.CharField(max_length=100, blank=True, null=True)
    assigned_ward = models.CharField(max_length=50, blank=True, null=True)
   
    def __str__(self):
        return f"Nurse #{self.user.nurseprofile.id} {self.user.username} - {self.user.email}"


class PharmacistProfile(BaseProfile):
    pharmacy_license_number = models.CharField(max_length=100, blank=True, null=True)
    pharmacy_assigned = models.CharField(max_length=100, blank=True, null=True)
    
    
    def __str__(self):
        return f"Pharmacist #{self.user.pharmacistprofile.id} {self.user.username} - {self.user.email}"
    
class LabTechProfile(BaseProfile): 
    lab_tech_license_number = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return f"LabTech #{self.user.labtechprofile.id} {self.user.username} - {self.user.email}"
    
    


class ParentProfile(BaseProfile):
    
    BLOOD_GROUPS = [
        ('A+', 'A Positive'),
        ('A-', 'A Negative'),
        ('B+', 'B Positive'),
        ('B-', 'B Negative'),
        ('O+', 'O Positive'),
        ('O-', 'O Negative'),
        ('AB+', 'AB Positive'),
        ('AB-', 'AB Negative'),
    ]
    
    
    profession = models.CharField(max_length=100, blank=True, null=True)
    number_of_children = models.PositiveIntegerField(blank=True, null=True)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS)
   
    def __str__(self):
        return f"Parent #{self.user.parentprofile.id} {self.user.username} - {self.user.email}"

