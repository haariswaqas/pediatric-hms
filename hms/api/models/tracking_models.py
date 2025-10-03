from django.db import models
from decimal import Decimal
from datetime import date

class GrowthRecord(models.Model):
    child = models.ForeignKey('Child', on_delete=models.CASCADE, related_name='growth_records')
    date_recorded = models.DateField(auto_now_add=True)  # Auto-set timestamp
    weight = models.DecimalField(max_digits=5, decimal_places=2)  # kg
    height = models.DecimalField(max_digits=5, decimal_places=2)  # cm
    bmi = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    bmi_interpretation = models.CharField(max_length=20, blank=True, null=True)  # Underweight, Normal, etc.

    def calculate_bmi(self):
        """Calculate BMI using height (cm) and weight (kg)."""
        if self.height and self.weight:
            height_in_meters = self.height / 100
            bmi = self.weight / (height_in_meters ** 2)
            return round(Decimal(str(bmi)), 2)
        return None

    def interpret_bmi(self):
        """Interpret BMI category based on standard classification."""
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

    def save(self, *args, **kwargs):
        """Auto-calculate BMI and its interpretation before saving."""
        self.bmi = self.calculate_bmi()
        self.bmi_interpretation = self.interpret_bmi()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.child.first_name} - {self.date_recorded}: {self.bmi} ({self.bmi_interpretation})"
