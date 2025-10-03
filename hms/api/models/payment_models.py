# billing/models.py (Payment model section)
import stripe
from django.conf import settings
from django.db import models
from decimal import Decimal
from .auth_models import User
from django.core.exceptions import ValidationError

stripe.api_key = settings.STRIPE_SECRET_KEY


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('insurance', 'Insurance'),
        ('mobile_money', 'Mobile Money'),
        ('bank_transfer', 'Bank Transfer'),
        ('check', 'Check'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('requires_action', 'Requires Action'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled'),
    ]

    bill = models.ForeignKey('Bill', related_name='payments', on_delete=models.CASCADE)
    stripe_payment_intent_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='card')
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Additional fields for better tracking
    reference_number = models.CharField(max_length=100, blank=True, help_text="Internal reference or transaction ID")
    notes = models.TextField(blank=True, help_text="Additional payment notes")
    processed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        help_text="User who processed this payment"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['bill', 'status']),
            models.Index(fields=['stripe_payment_intent_id']),
            models.Index(fields=['created_at']),
        ]

    def clean(self):
        """Validate payment amount doesn't exceed bill balance"""
        if self.amount <= 0:
            raise ValidationError("Payment amount must be greater than zero.")
        
        if self.bill_id:
            # For new payments, check if amount exceeds remaining balance
            if not self.pk:  # New payment
                remaining_balance = self.bill.balance_due
                if self.amount > remaining_balance:
                    raise ValidationError(
                        f"Payment amount (${self.amount}) cannot exceed remaining balance (${remaining_balance})"
                    )
            else:  # Existing payment being updated
                # Calculate what the new balance would be
                old_payment = Payment.objects.get(pk=self.pk)
                balance_with_old_payment_removed = self.bill.balance_due + old_payment.amount
                if self.amount > balance_with_old_payment_removed:
                    raise ValidationError(
                        f"Updated payment amount (${self.amount}) would exceed bill total"
                    )

    def __str__(self):
        return f"Payment {self.id} - {self.bill.bill_number} - ${self.amount} ({self.status})"

    def update_from_intent(self):
        """Update payment status from Stripe PaymentIntent"""
        if not self.stripe_payment_intent_id:
            raise ValueError("No Stripe PaymentIntent ID associated with this payment")
            
        try:
            intent = stripe.PaymentIntent.retrieve(self.stripe_payment_intent_id)
            stripe_status = intent.status
            
            # Map Stripe statuses to our internal choices
            status_mapping = {
                'requires_payment_method': 'failed',
                'requires_confirmation': 'pending',
                'requires_action': 'requires_action',
                'requires_source_action': 'requires_action',
                'processing': 'pending',
                'succeeded': 'completed',
                'canceled': 'cancelled',
            }
            
            new_status = status_mapping.get(stripe_status, 'pending')
            
            if self.status != new_status:
                old_status = self.status
                self.status = new_status
                self.save(update_fields=['status', 'updated_at'])
                print(f"Payment {self.id} status updated from {old_status} to {new_status} via Stripe")
                
        except stripe.error.StripeError as e:
            print(f"Error updating payment {self.id} from Stripe: {e}")
            raise

    @classmethod
    def create_stripe_intent(cls, bill_id, amount, currency='usd', payment_method=None):
        """Create a Stripe PaymentIntent for this bill"""
        try:
            intent_data = {
                'amount': int(amount * 100),  # Convert to cents
                'currency': currency.lower(),
                'payment_method_types': ['card'],
                'confirm': 'True',
                'payment_method': payment_method or 'pm_card_visa', 
                'metadata': {'bill_id': str(bill_id)}
            }
            
            # Add payment method if provided (for testing)
            if payment_method:
                intent_data.update({
                    'payment_method': payment_method,
                    'confirm': True
                })
            
            intent = stripe.PaymentIntent.create(**intent_data)
            return intent
            
        except stripe.error.StripeError as e:
            print(f"Error creating Stripe PaymentIntent: {e}")
            raise

    def refund(self, amount=None, reason=None):
        """Refund this payment (full or partial)"""
        if self.status != 'completed':
            raise ValueError("Only completed payments can be refunded")
        
        if not self.stripe_payment_intent_id:
            raise ValueError("Cannot refund payment without Stripe PaymentIntent ID")
        
        refund_amount = amount or self.amount
        if refund_amount > self.amount:
            raise ValueError("Refund amount cannot exceed payment amount")
        
        try:
            refund = stripe.Refund.create(
                payment_intent=self.stripe_payment_intent_id,
                amount=int(refund_amount * 100),  # Convert to cents
                reason=reason or 'requested_by_customer'
            )
            
            # Update payment status
            if refund_amount == self.amount:
                self.status = 'refunded'
            else:
                # For partial refunds, you might want to create a separate refund record
                # For now, we'll keep the status as completed
                pass
                
            self.save(update_fields=['status', 'updated_at'])
            return refund
            
        except stripe.error.StripeError as e:
            print(f"Error refunding payment {self.id}: {e}")
            raise

    @property
    def is_successful(self):
        """Check if payment was successful"""
        return self.status == 'completed'
    
    @property
    def can_be_refunded(self):
        """Check if payment can be refunded"""
        return self.status == 'completed' and self.stripe_payment_intent_id