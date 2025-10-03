from django.db import models
from .child_model import Child
from .auth_models import User
from django.core.exceptions import ValidationError
from django.utils import timezone


class Vaccine(models.Model):
    """
    Model to store vaccine information
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    recommended_age_start = models.PositiveIntegerField(help_text="Recommended start age in months")
    recommended_age_end = models.PositiveIntegerField(help_text="Recommended end age in months")
    doses_required = models.PositiveIntegerField(default=1)
    booster_required = models.BooleanField(default=False, null=True, blank=True)
    booster_interval_months = models.PositiveIntegerField(
        blank=True, null=True,
        help_text="Number of months after the initial dose for the booster."
    )
    is_active = models.BooleanField(default=True, null=True, blank=True)
    
    def __str__(self):
        return self.name
    


class VaccinationRecord(models.Model):
    """ 
    Model to track individual patient vaccination records 
    """ 
    DOSE_STATUS_CHOICES = [ 
        ('SCHEDULED', 'Scheduled'), 
        ('COMPLETED', 'Completed'), 
        ('MISSED', 'Missed'), 
        ('EXEMPTED', 'Exempted') 
    ] 
     
    child = models.ForeignKey(Child, on_delete=models.CASCADE,  related_name="vaccinations_received") 
    vaccine = models.ForeignKey(Vaccine, on_delete=models.CASCADE, related_name="vaccination_records") 
    dose_number = models.PositiveIntegerField() 
    scheduled_date = models.DateField() 
    is_administered = models.BooleanField(default=False, null=True, blank=True)
    administered_date = models.DateField(null=True, blank=True) 
    status = models.CharField(max_length=20, choices=DOSE_STATUS_CHOICES, default='SCHEDULED') 
    administered_by = models.ForeignKey( 
        User,  
        on_delete=models.SET_NULL,  
        null=True,  
        blank=True,  
        limit_choices_to={'role__in': ['doctor', 'nurse']}, 
    ) 
 
    batch_number = models.CharField(max_length=50, null=True, blank=True) 
    notes = models.TextField(blank=True, null=True) 
     
    def __str__(self): 
        return f"{self.child} - {self.vaccine} (Dose {self.dose_number})"
    
    def clean(self):
        """
        Perform additional validation checks
        """
        # Check that administered date is not in the future
        if self.administered_date and self.administered_date > timezone.now().date():
            raise ValidationError("Administered date cannot be in the future.")
        
        # Check that administered date is not before scheduled date
        if self.administered_date and self.administered_date < self.scheduled_date:
            raise ValidationError("Administered date cannot be before scheduled date.")
        
        # Check dose number doesn't exceed vaccine's required doses
        if self.dose_number > self.vaccine.doses_required:
            raise ValidationError(f"Dose number cannot exceed {self.vaccine.doses_required} for this vaccine.")
        
    def is_overdue(self):
        """Check if the child is overdue for this vaccine."""
        child_age = self.child.age_in_months()
        if child_age is not None:
            return child_age > self.vaccine.recommended_age_end
        return False

    
    from django.utils import timezone

    def save(self, *args, **kwargs):
        """
        Override save method to update status based on various conditions
        """

        # Automatically set administered_date if is_administered is True and no date provided
        if self.is_administered and not self.administered_date:
            self.administered_date = timezone.now().date()

        # Mark as MISSED if administered date is later than scheduled date
        if self.administered_date and self.administered_date > self.scheduled_date:
            self.status = 'MISSED'
        # Mark as COMPLETED if administered date is set and not missed
        elif self.administered_date:
            self.status = 'COMPLETED'

        # Validate before saving
        self.full_clean()

        super().save(*args, **kwargs)

    

