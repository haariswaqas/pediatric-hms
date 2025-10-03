from dateutil.relativedelta import relativedelta
from decimal import Decimal
from django.db import models
from datetime import date
from .tracking_models import GrowthRecord
class Child(models.Model):
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
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    # Guardian Information
    primary_guardian = models.ForeignKey('ParentProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='primary_children')
    secondary_guardian = models.ForeignKey('ParentProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='secondary_children')
    relationship_to_primary_guardian = models.CharField(max_length=50, blank=True, null=True)
    relationship_to_secondary_guardian = models.CharField(max_length=50, blank=True, null=True)
    
    # Child Information
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100)
    profile_picture = models.ImageField(upload_to='patient_profile_pictures/', blank=True, null=True)
    date_of_birth = models.DateField()
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    email = models.EmailField(unique=True, null=True, blank=True)
    
    # Health Information
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    birth_weight = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    birth_height = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    current_weight = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    current_height = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    current_bmi = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    current_bmi_interpretation = models.CharField(max_length=20, blank=True, null=True)  # Stores "Underweight", "Normal", etc.

    allergies = models.TextField(blank=True, null=True)
    chronic_conditions = models.TextField(blank=True, null=True)
    current_medications = models.TextField(blank=True, null=True)
    vaccination_status = models.TextField(blank=True, null=True)
    
    # Education Information
    school = models.CharField(max_length=200, blank=True, null=True)
    grade = models.CharField(max_length=50, blank=True, null=True)
    teacher_name = models.CharField(max_length=100, blank=True, null=True)
    school_phone = models.CharField(max_length=15, blank=True, null=True)
    
    # Emergency Information
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True, null=True)
    emergency_contact_relationship = models.CharField(max_length=50, blank=True, null=True)
    
    # Insurance Information
    insurance_provider = models.CharField(max_length=100, blank=True, null=True)
    insurance_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Medical History
    medical_history = models.TextField(blank=True, null=True)
    surgical_history = models.TextField(blank=True, null=True)
    family_medical_history = models.TextField(blank=True, null=True)
    developmental_notes = models.TextField(blank=True, null=True)
    special_needs = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f'ID {self.id}. {self.first_name}, child of #{self.primary_guardian.id}. {self.primary_guardian.user.username}'
    
    def calculate_bmi(self):
        """Calculate BMI using current height (in cm) and weight (in kg)"""
        if self.current_height and self.current_weight:
            height_in_meters = self.current_height / 100
            bmi = self.current_weight / (height_in_meters ** 2)
            return round(Decimal(str(bmi)), 2)
        return None

    def interpret_bmi(self):
        """Interpret BMI based on standard BMI categories"""
        bmi = self.calculate_bmi()
        if bmi:
            if bmi < 18.5:
                return "Underweight"
            elif 18.5 <= bmi < 24.9:
                return "Normal"
            elif 25.0 <= bmi < 29.9:
                return "Overweight"
            else:
                return "Obese"
        return None

    def calculate_age_decimal(self):
        """Calculate age in decimal years"""
        if self.date_of_birth:
            today = date.today()
            diff = relativedelta(today, self.date_of_birth)
            decimal_age = diff.years + (diff.months / 12) + (diff.days / 365.25)
            return round(Decimal(str(decimal_age)), 2)
        return None
    def age_in_months(self):
        """Calculate child's age in months from date of birth."""
        if self.date_of_birth:
            today = date.today()
            diff = relativedelta(today, self.date_of_birth)
            return diff.years * 12 + diff.months
        return None

    def save(self, *args, **kwargs):
        
        is_new = self.pk is None
        
        if not is_new:
            try:
                previous = Child.objects.get(pk=self.pk)
                # if weight or height changes, create a new GrowthRecord instance
                if previous.current_weight != self.current_weight or previous.current_height != self.current_height:
                    GrowthRecord.objects.create(
                        child=self,
                        weight=self.current_weight,
                        height=self.current_height
                        
                    )
            except Child.DoesNotExist:
                pass 
        """Override save method to calculate age, BMI, and BMI interpretation"""
        if self.date_of_birth:
            today = date.today()
            self.age = today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        
        self.current_bmi = self.calculate_bmi()
        self.current_bmi_interpretation = self.interpret_bmi()
        
        super().save(*args, **kwargs)

    def get_growth_history(self):
        """Retrieve and format all growth records for this child."""
        return [
            {
                "date_recorded": record.date_recorded,
                "weight": record.weight,
                "height": record.height,
                "bmi": record.calculate_bmi(),
                "bmi_interpretation": record.interpret_bmi()
            }
            for record in self.growth_records.all().order_by('-date_recorded')
    ]
