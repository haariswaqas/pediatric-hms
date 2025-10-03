from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import random
import string

class User(AbstractUser):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    
    ADMIN = 'admin'
    DOCTOR = 'doctor'
    NURSE = 'nurse'
    PHARMACIST = 'pharmacist'
    PARENT = 'parent'
    LAB_TECH = 'lab_tech'
    
    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (DOCTOR, 'Doctor'),
        (NURSE, 'Nurse'),
        (PHARMACIST, 'Pharmacist'),
        (PARENT, 'Parent'),
        (LAB_TECH, 'Lab_Tech')
    ]

    ACTIVE = 'active'
    BANNED = 'banned'
    SUSPENDED = 'suspended'
    ON_LEAVE = 'on_leave'
    
    STATUS_CHOICES = [
        (ACTIVE, 'Active'),
        (BANNED, 'Banned'),
        (SUSPENDED, 'Suspended'),
        (ON_LEAVE, 'On Leave'),
    ]

    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default=PARENT)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default=ACTIVE)
    created_by_admin = models.BooleanField(default=False)
    
    # this will only be used by medical professionals
    # there was an option to add this field inside the various profiles (eg. DoctorProfile, NurseProfile etc)
    # however, the pro with this approach is that tere will be no need to create a separate profile object just for the license document.
    # this will help avoid creation of multiple profiles per user
    # in that approach, i would have to handle profile creation inside the RegisterView within the auth_views.py
    # that means i would have had to make changes with the create_user_profile signal here. this would have made the code messy
    # the con with this approach is that, the license_document field will be empty for users who are PARENT. 
    # but i think this is a worthy tradeoff. 
    license_document = models.FileField(upload_to='medical_licenses/', blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__ (self):
        return f"#{self.id} ({self.role}). {self.username} - {self.email}"
    
class OTP(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=True)

    def __str__(self):
        return f"OTP for {self.user.email}: {self.code}"

    def is_expired(self):
        # OTP expires after 10 minutes (adjust as needed)
        expiry_time = self.created_at + timedelta(minutes=10)
        return timezone.now() > expiry_time

    @staticmethod
    def generate_otp():
        # Generate a 6-digit OTP code
        return ''.join(random.choices(string.digits, k=6))
