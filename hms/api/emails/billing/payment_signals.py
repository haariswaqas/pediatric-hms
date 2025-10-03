# billing/signals.py

from decimal import Decimal
from django.db import transaction
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from django.utils import timezone

from ...models import Payment, Bill


@receiver(pre_save, sender=Payment)
def track_old_payment_state(sender, instance, **kwargs):
    """
    Store previous amount and status before saving, for comparison in post_save.
    """
    if instance.pk:
        try:
            old = Payment.objects.get(pk=instance.pk)
            instance._old_amount = old.amount
            instance._old_status = old.status
        except Payment.DoesNotExist:
            instance._old_amount = None
            instance._old_status = None
    else:
        instance._old_amount = None
        instance._old_status = None


@receiver(post_save, sender=Payment)
def handle_payment_change(sender, instance, created, **kwargs):
    """
    Recalculate the Bill when:
      - A new Payment is created already in 'completed' state (rare but possible), or
      - An existing Payment transitions **to** 'completed' or 'refunded'.
    """
    new_status = instance.status
    old_status = getattr(instance, '_old_status', None)

    # On create: only recalc if it's already 'completed'
    if created:
        if new_status != 'completed':
            return
    else:
        # On update: only recalc on status change into completed/refunded
        if old_status == new_status or new_status not in ('completed', 'refunded'):
            return

    _recalculate_bill(instance.bill)


@receiver(post_delete, sender=Payment)
def handle_payment_delete(sender, instance, **kwargs):
    """
    Recalculate the Bill if a Payment is deleted (in case it was completed).
    """
    _recalculate_bill(instance.bill)


def _recalculate_bill(bill: Bill):
    """
    Sum all completed payments, update the Bill.amount_paid,
    determine overdue vs partial vs paid, and save.
    """
    paid_sum = bill.payments.filter(status='completed') \
                   .aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    with transaction.atomic():
        bill.amount_paid = paid_sum

        # Determine if overdue
        is_overdue = False
        if bill.due_date and bill.due_date < timezone.now().date():
            is_overdue = paid_sum < bill.total_amount

        # Set payment_status
        if paid_sum >= bill.total_amount:
            bill.payment_status = 'PAID'
        elif paid_sum > 0:
            bill.payment_status = 'OVERDUE' if is_overdue else 'PARTIAL'
        else:
            bill.payment_status = 'OVERDUE' if is_overdue else 'PENDING'

        # Bump the timestamp
        bill.updated_at = timezone.now()
        bill.save(update_fields=['amount_paid', 'payment_status', 'updated_at'])

    print(f"Bill {bill.bill_number}: amount_paid set to {paid_sum}, status {bill.payment_status}")


# ——— Optional: Logging and Stripe sync ———

@receiver(post_save, sender=Payment)
def log_payment_status_change(sender, instance, created, **kwargs):
    """
    Print a line when a Payment is created or its amount/status changes.
    """
    if created:
        print(f"New payment created: {instance}")
    else:
        old_status = getattr(instance, '_old_status', None)
        if old_status and old_status != instance.status:
            print(f"Payment {instance.id} status changed {old_status} → {instance.status}")
        old_amount = getattr(instance, '_old_amount', None)
        if old_amount and old_amount != instance.amount:
            print(f"Payment {instance.id} amount changed {old_amount} → {instance.amount}")


@receiver(post_save, sender=Payment)
def sync_with_stripe_on_update(sender, instance, created, **kwargs):
    """
    If the status was manually changed (or updated elsewhere),
    pull the current status from Stripe to stay in sync.
    """
    if instance.stripe_payment_intent_id and not created:
        old_status = getattr(instance, '_old_status', None)
        if old_status and old_status != instance.status:
            try:
                instance.update_from_intent()
                print(f"Synchronized payment {instance.id} status from Stripe")
            except Exception as e:
                print(f"Error syncing payment {instance.id}: {e}")
