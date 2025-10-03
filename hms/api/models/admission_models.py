from django.db import models
from .child_model import Child
from .hospital_models import Bed
from .auth_models import User  # For attending doctor; ensure this is your custom user model


class AdmissionRecord(models.Model):
    child = models.ForeignKey(
        Child,
        on_delete=models.CASCADE,
        related_name='admissions'
    )
    bed = models.ForeignKey(  # Changed from ForeignKey to OneToOneField
        Bed,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admission'
    )
    attending_doctor = models.ForeignKey(
        'DoctorProfile', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='admissions'
    )
    admission_date = models.DateTimeField(auto_now_add=True)
    discharge_date = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="Date when patient is discharged"
    )
    admission_reason = models.TextField(
        blank=True,
        null=True,
        help_text="Reason for admission"
    )
    initial_diagnosis = models.TextField(
        blank=True,
        null=True,
        help_text="Initial diagnosis upon admission"
    )
    diagnosis = models.ForeignKey('Diagnosis', on_delete=models.SET_NULL, null=True, blank=True)
    def __str__(self):
        return f"{self.id } - Admission for {self.child} on {self.admission_date.strftime('%Y-%m-%d')}"


class AdmissionVitalRecord(models.Model):
    admission = models.ForeignKey(AdmissionRecord, on_delete=models.CASCADE, related_name='vitals')
    temperature = models.DecimalField(max_digits=4, decimal_places=1, help_text="Temperature in Celsius")
    heart_rate = models.PositiveIntegerField(help_text="Heart rate in beats per minute")
    # Split blood pressure into two integer fields
    systolic = models.PositiveIntegerField(default=120,
        help_text="Systolic pressure in mm Hg"
    )
    diastolic = models.PositiveIntegerField(default=80,
        help_text="Diastolic pressure in mm Hg"
    )
    respiratory_rate = models.PositiveIntegerField(help_text="Breaths per minute")
    
    # Added vital signs
    oxygen_saturation = models.PositiveIntegerField(null=True, blank=True, help_text="SpO2 percentage (0-100)")
    head_circumference = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, help_text="Head circumference in centimeters")
    capillary_refill = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True, help_text="Capillary refill time in seconds")
    pain_score = models.PositiveIntegerField(null=True, blank=True, help_text="Pain score (0-10)")
    consciousness_level = models.CharField(max_length=50, null=True, blank=True, help_text="e.g., 'Alert', 'Verbal', 'Pain', 'Unresponsive' (AVPU scale)")
    glucose_level = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, help_text="Blood glucose in mg/dL")
    hydration_status = models.CharField(max_length=50, null=True, blank=True, help_text="e.g., 'Well hydrated', 'Mild dehydration', 'Moderate dehydration', 'Severe dehydration'")
    
    # Whether to update the Child model with these measurements
    update_child_record = models.BooleanField(default=True, help_text="Update the child's main record with weight/height/BMI if measured")
    
    recorded_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(null=True, blank=True, help_text="Additional observations or notes about vitals")
    taken_by = models.ForeignKey( 
        User,  
        on_delete=models.SET_NULL,  
        null=True,  
        blank=True,  
        limit_choices_to={'role__in': ['doctor', 'nurse']}, 
    ) 
    
    class Meta:
        ordering = ['-recorded_at']
    def interpret_bp(s, d):
        if s > 180 or d > 120:
            return "Hypertensive Crisis"
        if s >= 140 or d >= 90:
            return "Hypertension Stage 2"
        if 130 <= s <= 139 or 80 <= d <= 89:
            return "Hypertension Stage 1"
        if 120 <= s < 130 and d < 80:
            return "Elevated"
        if s < 90 and d < 60:
            return "Hypotension"
        return "Normal"

    
    def __str__(self):
        return f"{self.id }Admission Vitals for {self.admission.child.first_name} {self.admission.child.last_name} at {self.recorded_at.strftime('%Y-%m-%d %H:%M')}"
    
    def save(self, *args, **kwargs):
        is_new_record = self.pk is None  # Check if it's a new record before saving
        
        super().save(*args, **kwargs)  # Save the record first

        # Always create a history entry (whether it's a new record or an update)
        AdmissionVitalRecordHistory.objects.update_or_create(
            admission_vital_record=self,
            temperature=self.temperature,
            heart_rate=self.heart_rate,
            systolic=self.systolic,
            diastolic=self.diastolic,
            respiratory_rate=self.respiratory_rate,
            oxygen_saturation=self.oxygen_saturation,
            head_circumference=self.head_circumference,
            capillary_refill=self.capillary_refill,
            pain_score=self.pain_score,
            consciousness_level=self.consciousness_level,
            glucose_level=self.glucose_level,
            hydration_status=self.hydration_status,
            updated_by=self.taken_by  # Store the user who recorded/updated it
        )




class AdmissionVitalRecordHistory(models.Model):
    admission_vital_record = models.ForeignKey(
        "AdmissionVitalRecord",
        on_delete=models.CASCADE,
        related_name="history"
    )
    temperature = models.DecimalField(max_digits=4, decimal_places=1)
    heart_rate = models.PositiveIntegerField()
    systolic = models.PositiveIntegerField(default=120,
      help_text="Systolic pressure in mm Hg"
    )
    diastolic = models.PositiveIntegerField(default=80,
        help_text="Diastolic pressure in mm Hg"
    )
    respiratory_rate = models.PositiveIntegerField()
    
    # Optional fields
    oxygen_saturation = models.PositiveIntegerField(null=True, blank=True)
    head_circumference = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    capillary_refill = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    pain_score = models.PositiveIntegerField(null=True, blank=True)
    consciousness_level = models.CharField(max_length=50, null=True, blank=True)
    glucose_level = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    hydration_status = models.CharField(max_length=50, null=True, blank=True)

    # Store who updated it
    updated_by = models.ForeignKey(
        User,  
        on_delete=models.SET_NULL,  
        null=True,  
        blank=True,  
        limit_choices_to={'role__in': ['doctor', 'nurse']}, 
    )

    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"History of {self.admission_vital_record.id} at {self.updated_at}"
