from django.db import models
from .prescription_models import PrescriptionItem
from django.core.validators import MinValueValidator, MaxValueValidator


class Drug(models.Model):
    ROUTE_CHOICES = [
        ('PO', 'Oral'),
        ('IV', 'Intravenous'),
        ('IM', 'Intramuscular'),
        ('SC', 'Subcutaneous'),
        ('TOP', 'Topical'),
        ('INH', 'Inhalation'),
        ('REC', 'Rectal'),
        ('OPH', 'Ophthalmic'),
        ('OT', 'Otic'),
        ('NAS', 'Nasal'),
        ('SL', 'Sublingual'),
    ]
    
    name = models.CharField(max_length=255)
    generic_name = models.CharField(max_length=255, blank=True, null=True)
    brand_name = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    ndc_code = models.CharField("National Drug Code", max_length=100, blank=True, null=True)
    category = models.CharField(max_length=255, null=True, blank=True)
    dosage_form = models.CharField(max_length=100, null=True, blank=True)  # e.g., Tablet, Syrup, Injection
    route = models.CharField(max_length=3, choices=ROUTE_CHOICES, null=True, blank=True)
    strength = models.CharField(max_length=100, null=True, blank=True)  # e.g., 500mg, 5mg/ml
    concentration = models.CharField(max_length=100, blank=True, null=True)  # For liquid medications
    manufacturer = models.CharField(max_length=255, blank=True, null=True)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    quantity_in_stock = models.PositiveIntegerField(default=0)
    reorder_level = models.PositiveIntegerField(default=10)
    is_available = models.BooleanField(default=True)
    batch_number = models.CharField(max_length=100, blank=True, null=True)
    expiration_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Pediatric-specific fields
    requires_weight_based_dosing = models.BooleanField(default=False)
    minimum_age_months = models.PositiveIntegerField(blank=True, null=True, 
                                                    help_text="Minimum age in months")
    maximum_age_months = models.PositiveIntegerField(blank=True, null=True,
                                                    help_text="Maximum age in months")
    minimum_weight_kg = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    pediatric_notes = models.TextField(blank=True, null=True)
    special_storage = models.CharField(max_length=255, blank=True, null=True)
    controlled_substance = models.BooleanField(default=False)
    controlled_substance_class = models.CharField(max_length=10, blank=True, null=True)
    
    def is_low_stock(self):
        return self.quantity_in_stock <= self.reorder_level
    
    def __str__(self):
        return f"{self.name} {self.strength} ({self.dosage_form})"


class DrugInteraction(models.Model):
    SEVERITY_CHOICES = [
        ('MINOR', 'Minor'),
        ('MODERATE', 'Moderate'),
        ('MAJOR', 'Major'),
        ('CONTRAINDICATED', 'Contraindicated'),
    ]
    
    drug_one = models.ForeignKey('Drug', on_delete=models.CASCADE, related_name='interactions_as_first')
    drug_two = models.ForeignKey('Drug', on_delete=models.CASCADE, related_name='interactions_as_second')
    severity = models.CharField(max_length=15, choices=SEVERITY_CHOICES)
    description = models.TextField()
    alternative_suggestion = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ('drug_one', 'drug_two')
    
    def __str__(self):
        return f"{self.drug_one.name} + {self.drug_two.name}: {self.severity}"
    
    

class DrugDispenseRecord(models.Model):
    pharmacist = models.ForeignKey('PharmacistProfile', on_delete=models.SET_NULL, null=True, related_name='dispensed_drugs')
    prescription_item = models.ForeignKey('PrescriptionItem', on_delete=models.CASCADE, related_name='dispense_records')
    quantity_dispensed = models.PositiveIntegerField()
    batch_number = models.CharField(max_length=100, blank=True, null=True)
    date_dispensed = models.DateTimeField(auto_now_add=True)
    dispensing_notes = models.TextField(blank=True, null=True)
    is_refill = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.quantity_dispensed} of {self.prescription_item.drug.name} dispensed on {self.date_dispensed.strftime('%Y-%m-%d')}"
        
    def save(self, *args, **kwargs):
        # Update drug inventory
        drug = self.prescription_item.drug
        drug.quantity_in_stock -= self.quantity_dispensed
        drug.save()
        
        # Update refill count if applicable
        if self.is_refill:
            self.prescription_item.refills_used += 1
            self.prescription_item.save()
            
        super().save(*args, **kwargs)

