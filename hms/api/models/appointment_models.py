from django.db import models
from ..models import ParentProfile, DoctorProfile, Child

class Appointment(models.Model):
    

    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]

    parent = models.ForeignKey(ParentProfile, on_delete=models.CASCADE, null=True, blank=True, related_name="appointments")
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name="appointments")
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name="appointments")

    appointment_date = models.DateField(null=True, blank=True)  # Date (e.g., 2025-03-24)
    appointment_time = models.TimeField(null=True, blank=True)  # Time (e.g., 09:30:00)

    reason = models.TextField()  # Reason for the appointment
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')

    created_at = models.DateTimeField(auto_now_add=True)  # Track when the appointment was made
    updated_at = models.DateTimeField(auto_now=True)      # Track last update

    def __str__(self):
        return (
            f"Appointment with Dr. {self.doctor.user.username} "
            f"for {self.child} on {self.appointment_date} at {self.appointment_time}"
        )

    class Meta:
        ordering = ['-appointment_date', '-appointment_time']  # Show latest appointments first
        # to avoid the same exact appointment to be booked twice. 
        # attempting to do so will raise an IntegrityError at the DB level 
      
        """
class AppointmentVitalRecord(models.Model):
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='appointment_vitals')
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='vitals')
    temperature = models.DecimalField(max_digits=4, decimal_places=1, help_text="Temperature in Celsius")
    heart_rate = models.PositiveIntegerField(help_text="Heart rate in beats per minute")
    blood_pressure = models.CharField(max_length=20, help_text="e.g., '120/80'")
    respiratory_rate = models.PositiveIntegerField(help_text="Breaths per minute")
    
    # Added vital signs
    oxygen_saturation = models.PositiveIntegerField(null=True, blank=True, help_text="SpO2 percentage (0-100)")
    head_circumference = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, help_text="Head circumference in centimeters")
    capillary_refill = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True, help_text="Capillary refill time in seconds")
    pain_score = models.PositiveIntegerField(null=True, blank=True, help_text="Pain score (0-10)")
    consciousness_level = models.CharField(max_length=50, null=True, blank=True, help_text="e.g., 'Alert', 'Verbal', 'Pain', 'Unresponsive' (AVPU scale)")
    glucose_level = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, help_text="Blood glucose in mg/dL")
    
    # Growth tracking fields for regular appointments
    percentile_weight = models.PositiveIntegerField(null=True, blank=True, help_text="Weight percentile for age")
    percentile_height = models.PositiveIntegerField(null=True, blank=True, help_text="Height percentile for age")
    percentile_head = models.PositiveIntegerField(null=True, blank=True, help_text="Head circumference percentile for age")
    
    # Whether to update the Child model with these measurements
    update_child_record = models.BooleanField(default=True, help_text="Update the child's main record with weight/height/BMI if measured")
    
    recorded_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(null=True, blank=True, help_text="Additional observations or notes about vitals")
    taken_by = models.CharField(max_length=100, null=True, blank=True, help_text="Name of healthcare provider who recorded vitals")
    
    class Meta:
        ordering = ['-recorded_at']
    
    def __str__(self):
        return f"Appointment Vitals for {self.child} at {self.recorded_at.strftime('%Y-%m-%d %H:%M')}"
    
    def save(self, *args, **kwargs):
        Only method that updates child's weight/height/BMI if measured during appointment
        super().save(*args, **kwargs)
        # No automatic update of head_circumference since it doesn't exist in Child model        

        
        """
