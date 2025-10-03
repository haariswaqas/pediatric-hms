# lab_models.py
from django.db import models
class LabTest(models.Model):
    """Defines types of laboratory tests available in the system"""
    SAMPLE_TYPE_CHOICES = [
        ('BLOOD', 'Blood'),
        ('URINE', 'Urine'),
        ('STOOL', 'Stool'),
        ('CSF', 'Cerebrospinal Fluid'),
        ('SWAB', 'Swab'),
        ('TISSUE', 'Tissue'),
        ('SPUTUM', 'Sputum'),
        ('OTHER', 'Other')
    ]
    
    code = models.CharField(max_length=20, unique=True, help_text="Test code (e.g., CBC, LFT)")
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    sample_type = models.CharField(max_length=20, choices=SAMPLE_TYPE_CHOICES)
    sample_volume_required = models.CharField(max_length=50, blank=True, null=True, 
                                             help_text="e.g., '2-3 mL' or '5 mL'")
    preparation_instructions = models.TextField(blank=True, null=True, 
                                               help_text="Patient preparation instructions")
    collection_instructions = models.TextField(blank=True, null=True,
                                              help_text="Sample collection instructions")
    processing_time = models.PositiveIntegerField(help_text="Estimated processing time in hours")
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    requires_fasting = models.BooleanField(default=False)
    special_instructions = models.TextField(blank=True, null=True)
    
    # Pediatric-specific attributes
    minimum_age_months = models.PositiveIntegerField(blank=True, null=True)
    maximum_age_months = models.PositiveIntegerField(blank=True, null=True)
    pediatric_considerations = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class ReferenceRange(models.Model):
    """Reference ranges for lab test results, with age and gender specificity"""
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('ALL', 'All')
    ]
    
    lab_test = models.ForeignKey(LabTest, on_delete=models.CASCADE, related_name='reference_ranges')
    parameter_name = models.CharField(max_length=100)
    min_age_months = models.PositiveIntegerField(default=0)
    max_age_months = models.PositiveIntegerField(default=216)  # Up to 18 years
    gender = models.CharField(max_length=3, choices=GENDER_CHOICES, default='ALL')
    min_value = models.DecimalField(max_digits=10, decimal_places=3, blank=True, null=True)
    max_value = models.DecimalField(max_digits=10, decimal_places=3, blank=True, null=True)
    unit = models.CharField(max_length=20, null=True, blank=True)
    textual_reference = models.CharField(max_length=255, blank=True, null=True,
                                        help_text="For qualitative tests without numeric ranges")
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        if self.min_value is not None and self.max_value is not None:
            range_text = f"{self.min_value} - {self.max_value} {self.unit}"
        else:
            range_text = self.textual_reference or "No range specified"
            
        age_range = f"{self.min_age_months}-{self.max_age_months} months"
        
        return f"{self.parameter_name} ({age_range}, {self.get_gender_display()}): {range_text}"
    
    class Meta:
        unique_together = ('lab_test', 'parameter_name', 'min_age_months', 'max_age_months', 'gender')

