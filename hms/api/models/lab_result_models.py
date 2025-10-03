# lab_result_models.py
from django.db import models
from django.utils import timezone
from decimal import Decimal
from .lab_request_models import LabRequestItem

class LabResult(models.Model):
    lab_request_item = models.ForeignKey(LabRequestItem, on_delete=models.CASCADE, related_name='results')
    performed_by = models.ForeignKey('LabTechProfile', on_delete=models.SET_NULL, null=True, related_name='lab_tests_performed')
    verified_by = models.ForeignKey('LabTechProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='lab_results_verified_items')
    date_performed = models.DateTimeField(auto_now_add=True)
    date_verified = models.DateTimeField(blank=True, null=True)
    
    report_notes = models.TextField(blank=True, null=True)
    internal_notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Result for {self.lab_request_item}"
    
    def get_child_age_in_months(self):
        """
        Calculate the child's age in months at the time of the test.
        This is crucial for pediatric reference ranges as children's normal values
        change significantly with age.
        """
        child = self.lab_request_item.lab_request.child
        test_date = self.date_performed.date() if self.date_performed else timezone.now().date()
        
        # Calculate age in months from birth date to test date
        birth_date = child.date_of_birth
        age_years = test_date.year - birth_date.year
        age_months = test_date.month - birth_date.month
        
        # Adjust if the day hasn't been reached yet in the current month
        if test_date.day < birth_date.day:
            age_months -= 1
            
        total_months = (age_years * 12) + age_months
        return max(0, total_months)  # Ensure we don't return negative months
    
    def get_child_gender(self):
        """
        Get the child's gender for gender-specific reference ranges.
        Returns 'M' for Male, 'F' for Female, or 'ALL' as fallback.
        """
        child = self.lab_request_item.lab_request.child
        gender = getattr(child, 'gender', None)
        
        if gender and gender.upper() in ['M', 'MALE']:
            return 'M'
        elif gender and gender.upper() in ['F', 'FEMALE']:
            return 'F'
        else:
            return 'ALL'  # Fallback to unisex ranges
    
    def __str__(self):
        return f"Result for {self.lab_request_item}"



class LabResultParameter(models.Model):
    RESULT_STATUS_CHOICES = [
        ('NORMAL', 'Normal'),
        ('ABNORMAL', 'Abnormal'),
        ('CRITICAL', 'Critical'),
        ('INCONCLUSIVE', 'Inconclusive')
    ]
   
    lab_result = models.ForeignKey(LabResult, on_delete=models.CASCADE, related_name='parameters')
    parameter_name = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=10, decimal_places=3, blank=True, null=True)
    unit = models.CharField(max_length=20, blank=True, null=True)
    reference_range = models.ForeignKey('ReferenceRange', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=15, choices=RESULT_STATUS_CHOICES, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        if self.unit:
            return f"{self.parameter_name}: {self.value} {self.unit}"
        return f"{self.parameter_name}: {self.value}"
    
    def find_appropriate_reference_range(self):
        """
        Find the most appropriate reference range for this parameter based on:
        1. Lab test type
        2. Parameter name (exact match)
        3. Child's age in months
        4. Child's gender (with fallback to 'ALL')
        
        This method prioritizes gender-specific ranges but falls back to 
        general ranges if gender-specific ones aren't available.
        """
        from .lab_models import ReferenceRange
        
        # Get child's demographics
        child_age_months = self.lab_result.get_child_age_in_months()
        child_gender = self.lab_result.get_child_gender()
        
        # Get the lab test
        lab_test = self.lab_result.lab_request_item.lab_test
        
        # Try to find gender-specific reference range first
        reference_range = ReferenceRange.objects.filter(
            lab_test=lab_test,
            parameter_name=self.parameter_name,
            min_age_months__lte=child_age_months,
            max_age_months__gte=child_age_months,
            gender=child_gender
        ).first()
        
        # If no gender-specific range found, try general ranges
        if not reference_range:
            reference_range = ReferenceRange.objects.filter(
                lab_test=lab_test,
                parameter_name=self.parameter_name,
                min_age_months__lte=child_age_months,
                max_age_months__gte=child_age_months,
                gender='ALL'
            ).first()
        
        return reference_range
    
    def auto_assign_unit_from_reference_range(self):
        """
        Automatically assign the unit from the appropriate reference range.
        This should be called before determining status to ensure unit consistency.
        """
        ref_range = self.find_appropriate_reference_range()
        
        if ref_range and ref_range.unit:
            self.unit = ref_range.unit
            # Store the reference range for later use
            self.reference_range = ref_range
        else:
            # Clear unit if no reference range found or reference range has no unit
            self.unit = None
            self.reference_range = None
    def determine_status(self):
        """
        Determine the status of this lab result parameter by comparing
        the measured value against age and gender-appropriate reference ranges.
        
        Logic:
        1. Find appropriate reference range and auto-assign unit
        2. Compare value against min/max bounds
        3. Determine if result is normal, abnormal, or critical
        4. Handle qualitative tests (textual references)
        
        Returns the determined status as a string.
        """
        # If no value is provided, mark as inconclusive
        if self.value is None:
            return 'INCONCLUSIVE'
        
        # Auto-assign unit from reference range first
        self.auto_assign_unit_from_reference_range()
        
        # Use the reference range that was set during unit assignment
        ref_range = self.reference_range
        
        if not ref_range:
            # No reference range found - cannot determine status
            self.notes = f"No reference range found for {self.parameter_name} " \
                        f"(age: {self.lab_result.get_child_age_in_months()} months, " \
                        f"gender: {self.lab_result.get_child_gender()})"
            return 'INCONCLUSIVE'
        
        # Handle qualitative tests (those with textual references)
        if ref_range.textual_reference and not (ref_range.min_value or ref_range.max_value):
            # For qualitative tests, we'd need additional logic
            # For now, assume normal unless specified otherwise
            return 'NORMAL'
        
        # Handle quantitative tests with numeric ranges
        if ref_range.min_value is not None or ref_range.max_value is not None:
            value = Decimal(str(self.value))
            
            # Check if value is within normal range
            within_min = ref_range.min_value is None or value >= ref_range.min_value
            within_max = ref_range.max_value is None or value <= ref_range.max_value
            
            if within_min and within_max:
                return 'NORMAL'
            else:
                # Determine if it's just abnormal or critical
                # This logic can be customized based on hospital protocols
                
                # Example: Values 50% outside range might be considered critical
                if ref_range.min_value is not None and value < ref_range.min_value:
                    deviation = (ref_range.min_value - value) / ref_range.min_value
                    if deviation > 0.5:  # 50% below minimum
                        return 'CRITICAL'
                    else:
                        return 'ABNORMAL'
                
                if ref_range.max_value is not None and value > ref_range.max_value:
                    deviation = (value - ref_range.max_value) / ref_range.max_value
                    if deviation > 0.5:  # 50% above maximum
                        return 'CRITICAL'
                    else:
                        return 'ABNORMAL'
        
        return 'INCONCLUSIVE'
    
    def save(self, *args, **kwargs):
        """
        Override save method to automatically determine status and assign unit before saving.
        This ensures both unit and status are always current when a parameter is saved.
        """
        # Auto-determine status (which also auto-assigns unit) if not manually set
        if not kwargs.pop('skip_status_determination', False):
            self.status = self.determine_status()
        
        super().save(*args, **kwargs)
    
    def update_status(self):
        """
        Public method to manually trigger status update and unit assignment.
        Useful when reference ranges change or need to recalculate status.
        """
        self.status = self.determine_status()  # This also updates the unit
        self.save(skip_status_determination=True)  # Avoid recursive status determination
    
    def get_status_explanation(self):
        """
        Provide a human-readable explanation of why this status was determined.
        Useful for lab reports and clinical decision support.
        """
        if self.value is None:
            return "No value provided for analysis"
        
        if not self.reference_range:
            return f"No appropriate reference range found for {self.parameter_name}"
        
        ref_range = self.reference_range
        value = Decimal(str(self.value))
        
        explanation = f"Value: {value}"
        if self.unit:
            explanation += f" {self.unit}"
        
        if ref_range.min_value is not None and ref_range.max_value is not None:
            explanation += f" | Reference Range: {ref_range.min_value} - {ref_range.max_value}"
        elif ref_range.min_value is not None:
            explanation += f" | Minimum Normal: {ref_range.min_value}"  
        elif ref_range.max_value is not None:
            explanation += f" | Maximum Normal: {ref_range.max_value}"
        
        if ref_range.unit:
            explanation += f" {ref_range.unit}"
            
        explanation += f" | Age Range: {ref_range.min_age_months}-{ref_range.max_age_months} months"
        explanation += f" | Gender: {ref_range.get_gender_display()}"
        
        return explanation
    
    def __str__(self):
        if self.unit:
            return f"{self.parameter_name}: {self.value} {self.unit} ({self.get_status_display()})"
        return f"{self.parameter_name}: {self.value} ({self.get_status_display()})"
    
    class Meta:
        # Ensure parameter names are consistent within a lab result
        unique_together = ('lab_result', 'parameter_name')