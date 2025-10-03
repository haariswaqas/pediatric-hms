from django.db import models
from .profile_models import DoctorProfile, NurseProfile, LabTechProfile, PharmacistProfile
from .auth_models import User

class Shift(models.Model):
    DAY_CHOICES = [
        ('Monday', 'Monday'), ('Tuesday', 'Tuesday'), ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'), ('Friday', 'Friday'), ('Saturday', 'Saturday'), ('Sunday', 'Sunday')
    ]

    day = models.CharField(max_length=10, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.day}: {self.start_time} - {self.end_time}"


class DoctorShiftAssignment(models.Model):
    doctor = models.ForeignKey(
        DoctorProfile, on_delete=models.CASCADE, related_name="shift_assignments"
    )
    shifts = models.ManyToManyField(
        Shift, related_name="doctor_assignments"
    )
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'admin'},  # Filters to only users with role='admin'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dr. {self.doctor.user.get_full_name()} → {', '.join(str(s) for s in self.shifts.all())}"


class NurseShiftAssignment(models.Model):
    nurse = models.ForeignKey(
        NurseProfile, on_delete=models.CASCADE, related_name="shift_assignments"
    )
    shifts = models.ManyToManyField(
        Shift, related_name="nurse_assignments"
    )
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'admin'},
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Nurse {self.nurse.user.get_full_name()} → {', '.join(str(s) for s in self.shifts.all())}"


class PharmacistShiftAssignment(models.Model):
    pharmacist = models.ForeignKey(
        PharmacistProfile, on_delete=models.CASCADE, related_name="shift_assignments"
    )
    shifts = models.ManyToManyField(
        Shift, related_name="pharmacist_assignments"
    )
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'admin'},
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pharmacist {self.pharmacist.user.get_full_name()} → {', '.join(str(s) for s in self.shifts.all())}"


class LabTechShiftAssignment(models.Model):
    lab_tech = models.ForeignKey(
        LabTechProfile, on_delete=models.CASCADE, related_name="shift_assignments"
    )
    shifts = models.ManyToManyField(
        Shift, related_name="lab_tech_assignments"
    )
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'admin'},
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Lab Tech {self.lab_tech.user.get_full_name()} → {', '.join(str(s) for s in self.shifts.all())}"
