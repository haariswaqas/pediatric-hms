from django.db import models
from django.utils import timezone
from .auth_models import User



class Prescription(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
    ]
    
    doctor = models.ForeignKey('DoctorProfile', on_delete=models.SET_NULL, null=True, related_name='prescriptions_given')
    child = models.ForeignKey('Child', on_delete=models.CASCADE, related_name='prescriptions_received')
    diagnosis = models.ForeignKey('Diagnosis', on_delete=models.SET_NULL, null=True, blank=True, related_name='prescription_diagnosis')
    weight_at_prescription = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text="Weight in kg at time of prescription"
    )
    date_prescribed = models.DateTimeField(auto_now_add=True)
    valid_from = models.DateField(auto_now_add=True)
    valid_until = models.DateField(null=True, blank=True)
   
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    
    def save(self, *args, **kwargs):
        """
        Before saving, if valid_until is today or in the past and the status
        isn't already EXPIRED, flip the status to EXPIRED.
        """
        if self.valid_until:
            today = timezone.localdate()
            if today >= self.valid_until and self.status != 'EXPIRED':
                self.status = 'EXPIRED'
        super().save(*args, **kwargs)
    def __str__(self):
        return f"Prescription for {self.child} by Dr. {self.doctor} on {self.date_prescribed.strftime('%Y-%m-%d')}"


class PrescriptionItem(models.Model):
    FREQUENCY_CHOICES = [
        ('QD', 'Once daily'),
        ('BID', 'Twice daily'),
        ('TID', 'Three times daily'),
        ('QID', 'Four times daily'),
        ('Q4H', 'Every 4 hours'),
        ('Q6H', 'Every 6 hours'),
        ('Q8H', 'Every 8 hours'),
        ('Q12H', 'Every 12 hours'),
        ('PRN', 'As needed'),
        ('STAT', 'Immediately'),
        ('AC', 'Before meals'),
        ('PC', 'After meals'),
        ('HS', 'At bedtime'),
    ]
    
    DURATION_UNIT_CHOICES = [
        ('DAYS', 'Days'),
        ('WEEKS', 'Weeks'),
        ('MONTHS', 'Months'),
    ]
    
    prescription = models.ForeignKey('Prescription', on_delete=models.CASCADE, related_name='items')
    drug = models.ForeignKey('Drug', on_delete=models.CASCADE)
    dosage = models.CharField(max_length=100)  # e.g., "10mg/kg", "5ml", "1 tablet"
    frequency = models.CharField(max_length=5, choices=FREQUENCY_CHOICES)
    duration_value = models.PositiveIntegerField(default=1)
    duration_unit = models.CharField(max_length=6, choices=DURATION_UNIT_CHOICES, default='DAYS')
    max_refills = models.PositiveIntegerField(default=0)
    refills_used = models.PositiveIntegerField(default=0)
    instructions = models.TextField(blank=True, null=True)
    is_weight_based = models.BooleanField(default=False)
    
    # For weight-based dosing
    dose_per_kg = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    min_dose = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    max_dose = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    
    def refills_remaining(self):
        return self.max_refills - self.refills_used
    
    def is_refillable(self):
        return self.refills_remaining() > 0 and self.prescription.status == 'ACTIVE'
    
    def full_duration(self):
        if self.duration_unit == 'DAYS':
            return f"{self.duration_value} days"
        elif self.duration_unit == 'WEEKS':
            return f"{self.duration_value} weeks"
        else:
            return f"{self.duration_value} months"
    
    def calculate_weight_based_dose(self, weight_kg):
        if not self.is_weight_based:
            return None
            
        calculated_dose = weight_kg * self.dose_per_kg
        
        # Apply minimum and maximum dose limits if provided
        if self.min_dose and calculated_dose < self.min_dose:
            return self.min_dose
        if self.max_dose and calculated_dose > self.max_dose:
            return self.max_dose
            
        return calculated_dose
    
    def __str__(self):
        return f"{self.drug.name} - {self.dosage} {self.frequency} for {self.full_duration()}"


class AdverseReaction(models.Model):
    SEVERITY_CHOICES = [
        ('MILD', 'Mild'),
        ('MODERATE', 'Moderate'),
        ('SEVERE', 'Severe'),
        ('LIFE_THREATENING', 'Life-threatening'),
    ]
    
    child = models.ForeignKey('Child', on_delete=models.CASCADE, related_name='adverse_reactions')
    drug = models.ForeignKey('Drug', on_delete=models.CASCADE, related_name='adverse_reactions')
    prescription_item = models.ForeignKey('PrescriptionItem', on_delete=models.SET_NULL, null=True, blank=True)
    reaction_description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    date_reported = models.DateTimeField(auto_now_add=True)
    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, 
                                    limit_choices_to={'role__in': ['doctor', 'nurse', 'pharmacist', 'lab_tech']},)

    actions_taken = models.TextField(blank=True, null=True)
    resolution = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.child} - {self.drug.name} - {self.severity} reaction on {self.date_reported.strftime('%Y-%m-%d')}"