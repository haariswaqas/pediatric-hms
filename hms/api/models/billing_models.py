# billing/models.py
from django.db import models
from .child_model import Child
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone
from decimal import Decimal

class Bill(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PARTIAL', 'Partially Paid'),
        ('PAID', 'Fully Paid'),
        ('OVERDUE', 'Overdue'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='bills')
    bill_number = models.CharField(max_length=50, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateField(null=True, blank=True)
    
    # Financial fields
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    notes = models.TextField(blank=True)
    
    def save(self, *args, **kwargs):
        creating = self._state.adding
        if creating:
            # First save to get a primary key
            super().save(*args, **kwargs)
            # Generate unique bill_number if not set
            if not self.bill_number:
                today = timezone.now().strftime('%Y%m%d')
                self.bill_number = f"BL-{today}-{self.pk:04d}"
                super().save(update_fields=['bill_number'])
            return

        # On updates, recalc totals and save financials
        super().save(*args, **kwargs)
        self.calculate_totals()
        super().save(update_fields=['subtotal', 'total_amount'])
    
    def calculate_totals(self):
        """Calculate subtotal and total amount from bill items"""
        # Sum all line item amounts
        self.subtotal = sum(item.amount for item in self.items.all())
        # Cast tax and discount to Decimal to avoid float mix
        tax = Decimal(str(self.tax_amount))
        discount = Decimal(str(self.discount_amount))
        # total = subtotal + tax - discount
        self.total_amount = (self.subtotal + tax - discount).quantize(Decimal('0.01'))
    
    def update_payment_status(self):
        """Update payment status based on amount paid"""
        if self.amount_paid >= self.total_amount:
            self.payment_status = 'PAID'
        elif self.amount_paid > 0:
            self.payment_status = 'PARTIAL'
        else:
            self.payment_status = 'PENDING'
    
    @property
    def balance_due(self):
        return max(self.total_amount - self.amount_paid, Decimal('0.00'))
    
    def __str__(self):
        return f"Bill {self.bill_number} - {self.child.first_name} - ${self.total_amount}"

class BillItem(models.Model):
    bill = models.ForeignKey(Bill, related_name='items', on_delete=models.CASCADE)
    description = models.CharField(max_length=500)
    quantity = models.DecimalField(max_digits=10, decimal_places=3, default=Decimal('1.000'))
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Generic foreign key to link to prescription items, procedures, etc.
    content_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    linked_object = GenericForeignKey('content_type', 'object_id')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Calculate amount if not provided
        if self.amount is None:
            self.amount = (self.quantity * self.unit_price).quantize(Decimal('0.01'))
        super().save(*args, **kwargs)
        # Trigger bill totals recalculation
        self.bill.save()
    
    def __str__(self):
        return f"{self.description} - ${self.amount}"
