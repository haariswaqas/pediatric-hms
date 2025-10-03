from django.db import models
from .auth_models import User
from django.utils import timezone



class Diagnosis(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('RESOLVED', 'Resolved'),
        ('CHRONIC', 'Chronic'),
        ('RECURRENT', 'Recurrent'),
        ('PROVISIONAL', 'Provisional'),
        ('RULE_OUT', 'Rule Out'),
    ]
    
    SEVERITY_CHOICES = [
        ('MILD', 'Mild'),
        ('MODERATE', 'Moderate'),
        ('SEVERE', 'Severe'),
        ('CRITICAL', 'Critical'),
    ]
    appointment = models.ForeignKey('Appointment', on_delete=models.SET_NULL, null=True, blank=True, related_name='diagnoses')
    child = models.ForeignKey('Child', on_delete=models.CASCADE, related_name='diagnoses')
    doctor = models.ForeignKey('DoctorProfile', on_delete=models.SET_NULL, null=True, related_name='diagnoses_made')
    category = models.CharField(max_length=100, null=True, blank=True)
    
    # Using ICD-10 code for standardization
    icd_code = models.CharField(max_length=10, blank=True, null=True, help_text="ICD-10 diagnosis code")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Diagnosis attributes
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, blank=True, null=True)
    onset_date = models.DateField(default=timezone.now, help_text="When symptoms first appeared")
    date_diagnosed = models.DateTimeField(auto_now_add=True)
    resolution_date = models.DateField(blank=True, null=True)
    
    # For tracking chronic conditions or recurrence
    is_chronic = models.BooleanField(default=False)
    is_congenital = models.BooleanField(default=False)
    
    # Clinical notes and observations
    clinical_findings = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    history = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='related_diagnoses')
    
    def duration(self):
        if self.resolution_date:
            return (self.resolution_date - self.onset_date.date()).days
        return (timezone.now().date() - self.onset_date.date()).days
    
    def __str__(self):
        return f"{self.title} - ({self.date_diagnosed.strftime('%Y-%m-%d')})"


class DiagnosisAttachment(models.Model):
    diagnosis = models.ForeignKey(Diagnosis, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='diagnoses/attachments/')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(
    User, 
    on_delete=models.SET_NULL, 
    null=True,
    limit_choices_to={'role__in': ['doctor', 'nurse', 'pharmacist', 'lab_tech']}
)

    
    def __str__(self):
        return f"{self.title} - {self.diagnosis}"


class Treatment(models.Model):
    diagnosis = models.ForeignKey(Diagnosis, on_delete=models.CASCADE, related_name='treatments')
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} for {self.diagnosis.title}"