from django.db import models
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


class Ward(models.Model):
    WARD_TYPES = [
        ('GENERAL', 'General Ward'),
        ('NICU', 'Neonatal Intensive Care Unit'),
        ('PICU', 'Pediatric Intensive Care Unit'),
        ('PRIVATE', 'Private Room'),
        ('ISOLATION', 'Isolation Ward'),
        ('SURGICAL', 'Surgical Ward'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    ward_type = models.CharField(max_length=20, choices=WARD_TYPES)
    capacity = models.PositiveIntegerField(help_text="Total number of beds the ward can hold")
    available_beds = models.PositiveIntegerField(default=0, help_text="Number of currently available beds")
    
    def __str__(self):
        return f"{self.name} ({self.get_ward_type_display()})"
    
    def update_available_beds(self):
        """Updates available_beds based on unoccupied beds."""
        self.available_beds = self.beds.filter(is_occupied=False).count()
        self.save(update_fields=['available_beds'])
    
    @property
    def occupancy_rate(self):
        """Return the ward's occupancy rate as a percentage."""
        occupied = self.capacity - self.available_beds
        if self.capacity > 0:
            return (occupied / self.capacity) * 100
        return 0
    
    @property
    def beds_count(self):
        """Return the total number of beds assigned to the ward."""
        return self.beds.count()


class Bed(models.Model):
    ward = models.ForeignKey(
        Ward,
        on_delete=models.CASCADE,
        related_name='beds'
    )
    bed_number = models.CharField(max_length=10, help_text="Unique bed number within the ward")
    is_occupied = models.BooleanField(default=False)
    last_cleaned = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, help_text="Additional information about the bed")
    
    def __str__(self):
        status = "Occupied" if self.is_occupied else "Available"
        return f"Bed {self.bed_number} in {self.ward.name} - {status}"
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['ward', 'bed_number'], name='unique_bed_in_ward')
        ]
        ordering = ['ward', 'bed_number']
    
    def clean(self):
        """Prevent adding a bed if capacity is exceeded."""
        if self._state.adding:  # only check on creation
            if self.ward.beds.count() >= self.ward.capacity:
                raise ValidationError(f"Cannot add more beds. Ward '{self.ward.name}' has reached its capacity of {self.ward.capacity} beds.")
    
    def save(self, *args, **kwargs):
        self.full_clean()  # trigger `clean()` method
        super().save(*args, **kwargs)
        # We'll use signals for updating ward stats instead of doing it here


# Use signals for better performance and maintainability
@receiver(post_save, sender=Bed)
@receiver(post_delete, sender=Bed)
def update_ward_stats(sender, instance, **kwargs):
    """Update ward statistics when beds are saved or deleted."""
    if hasattr(instance, 'ward') and instance.ward:
        instance.ward.update_available_beds()