# billing/signals.py
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.db.models import Sum, Q
from decimal import Decimal
from ...models import Payment


@receiver(post_save, sender=Payment)
def update_bill_on_payment_save(sender, instance, created, **kwargs):
    """
    Update bill totals and payment status when a payment is saved.
    This handles both new payments and updates to existing payments.
    """
    bill = instance.bill
    update_bill_payment_totals(bill)


@receiver(post_delete, sender=Payment)
def update_bill_on_payment_delete(sender, instance, **kwargs):
    """
    Update bill totals and payment status when a payment is deleted.
    """
    bill = instance.bill
    update_bill_payment_totals(bill)


@receiver(pre_save, sender=Payment)
def track_payment_amount_change(sender, instance, **kwargs):
    """
    Track if payment amount changed to trigger bill updates appropriately.
    Store the old amount for comparison.
    """
    if instance.pk:  # Only for existing payments
        try:
            old_payment = Payment.objects.get(pk=instance.pk)
            instance._old_amount = old_payment.amount
            instance._old_status = old_payment.status
        except Payment.DoesNotExist:
            instance._old_amount = None
            instance._old_status = None
    else:
        instance._old_amount = None
        instance._old_status = None


def update_bill_payment_totals(bill):
    """
    Recalculate bill payment totals and update payment status.
    Only counts completed payments toward the total.
    """
    # Calculate total amount paid from completed payments only
    completed_payments = bill.payments.filter(
        status='completed'
    ).aggregate(
        total_paid=Sum('amount')
    )
    
    # Update bill's amount_paid
    new_amount_paid = completed_payments['total_paid'] or Decimal('0.00')
    old_amount_paid = bill.amount_paid
    
    bill.amount_paid = new_amount_paid
    
    # Update payment status based on new amount
    update_bill_payment_status(bill)
    
    # Save the bill with updated fields
    # Use update_fields to avoid triggering calculate_totals unnecessarily
    bill.save(update_fields=['amount_paid', 'payment_status', 'updated_at'])
    
    print(f"Bill {bill.bill_number}: Amount paid updated from ${old_amount_paid} to ${new_amount_paid}")
    print(f"Bill {bill.bill_number}: Payment status: {bill.payment_status}")


def update_bill_payment_status(bill):
    """
    Update bill payment status based on amount paid vs total amount.
    Matches the logic from your Bill model's update_payment_status method.
    """
    # Ensure we have the latest total_amount
    if not hasattr(bill, '_total_amount_calculated'):
        bill.calculate_totals()
    
    # Check if bill is overdue (optional - you can customize this logic)
    from django.utils import timezone
    is_overdue = (
        bill.due_date and 
        bill.due_date < timezone.now().date() and 
        bill.amount_paid < bill.total_amount
    )
    
    # Determine payment status
    if bill.amount_paid >= bill.total_amount:
        bill.payment_status = 'PAID'
    elif bill.amount_paid > 0:
        if is_overdue:
            bill.payment_status = 'OVERDUE'  # Partial payment but overdue
        else:
            bill.payment_status = 'PARTIAL'
    else:
        if is_overdue:
            bill.payment_status = 'OVERDUE'
        else:
            bill.payment_status = 'PENDING'


# Additional signal to handle payment status changes
@receiver(post_save, sender=Payment)
def log_payment_status_change(sender, instance, created, **kwargs):
    """
    Log payment status changes for audit purposes.
    """
    if created:
        print(f"New payment created: {instance}")
    else:
        # Check if status changed
        old_status = getattr(instance, '_old_status', None)
        if old_status and old_status != instance.status:
            print(f"Payment {instance.id} status changed from {old_status} to {instance.status}")
            
        # Check if amount changed
        old_amount = getattr(instance, '_old_amount', None)
        if old_amount and old_amount != instance.amount:
            print(f"Payment {instance.id} amount changed from ${old_amount} to ${instance.amount}")


# Signal to handle payment method changes that might affect processing
@receiver(pre_save, sender=Payment)
def validate_payment_status_transition(sender, instance, **kwargs):
    """
    Validate that payment status transitions are logical.
    """
    if instance.pk:  # Only for existing payments
        try:
            old_payment = Payment.objects.get(pk=instance.pk)
            old_status = old_payment.status
            new_status = instance.status
            
            # Define valid status transitions
            valid_transitions = {
                'pending': ['requires_action', 'completed', 'failed'],
                'requires_action': ['completed', 'failed', 'pending'],
                'completed': ['refunded'],  # Completed payments can only be refunded
                'failed': ['pending', 'requires_action'],  # Failed payments can be retried
                'refunded': [],  # Refunded payments cannot change status
            }
            
            if old_status != new_status:
                allowed_statuses = valid_transitions.get(old_status, [])
                if new_status not in allowed_statuses:
                    raise ValueError(
                        f"Invalid status transition from '{old_status}' to '{new_status}'. "
                        f"Allowed transitions: {allowed_statuses}"
                    )
                    
        except Payment.DoesNotExist:
            pass  # New payment, no validation needed


# Utility function to manually recalculate all bill payments (useful for data migration)
def recalculate_all_bill_payments():
    """
    Utility function to recalculate payment totals for all bills.
    Useful for data migration or fixing inconsistencies.
    """
    from ...models import Bill
    
    bills_updated = 0
    for bill in Bill.objects.all():
        old_amount_paid = bill.amount_paid
        old_status = bill.payment_status
        
        update_bill_payment_totals(bill)
        
        if bill.amount_paid != old_amount_paid or bill.payment_status != old_status:
            bills_updated += 1
            print(f"Updated Bill {bill.bill_number}: ${old_amount_paid} -> ${bill.amount_paid}, {old_status} -> {bill.payment_status}")
    
    print(f"Total bills updated: {bills_updated}")


# Signal to handle Stripe webhook updates
@receiver(post_save, sender=Payment)
def sync_with_stripe_on_update(sender, instance, created, **kwargs):
    """
    Sync payment status with Stripe when payment is updated.
    Only for payments that have Stripe payment intent IDs.
    """
    if instance.stripe_payment_intent_id and not created:
        # Only sync if status might have changed externally
        old_status = getattr(instance, '_old_status', None)
        if old_status and old_status != instance.status:
            try:
                # Update from Stripe to ensure consistency
                instance.update_from_intent()
                print(f"Synced payment {instance.id} with Stripe status")
            except Exception as e:
                print(f"Failed to sync payment {instance.id} with Stripe: {e}")