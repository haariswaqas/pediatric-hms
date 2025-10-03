# billing/signals/consultation_billing_signals.py

from decimal import Decimal, ROUND_HALF_UP
import logging
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from ...models import Bill, BillItem, Appointment


logger = logging.getLogger(__name__)


@receiver(post_save, sender=Appointment)
def create_consultation_bill(sender, instance, created, **kwargs):
    """
    Automatically creates a Bill and BillItem for a consultation
    when a new Appointment is created and has a consultation fee.
    """
    if not created:
        return

    doctor = instance.doctor
    child = instance.child
    fee = doctor.consultation_fee or Decimal('0.00')
    
    if fee <= 0:
        logger.info(f"Doctor {doctor.user.username} has no consultation fee set. No billing created.")
        return

    ct_appointment = ContentType.objects.get_for_model(Appointment)

    with transaction.atomic():
        # Create the bill
        bill = Bill.objects.create(child=child)

        description = (
            f"Consultation with Dr. {doctor.user.get_full_name() or doctor.user.username} "
            f"on {instance.appointment_date} at {instance.appointment_time}"
        )

        BillItem.objects.create(
            bill=bill,
            description=description,
            quantity=Decimal('1.0'),
            unit_price=fee,
            amount=fee.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            content_type=ct_appointment,
            object_id=instance.id
        )

        bill.save()  # Trigger total recalculation

        logger.info(f"Created consultation Bill #{bill.bill_number} for child {child.first_name}, amount ${bill.total_amount}")
