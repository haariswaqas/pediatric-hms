# billing/prescription_billing_signals.py
from decimal import Decimal, ROUND_HALF_UP
import logging
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from ...models import Bill, BillItem, PrescriptionItem


logger = logging.getLogger(__name__)


@receiver(post_save, sender=PrescriptionItem)
def create_or_update_bill_for_prescription(sender, instance, created, **kwargs):
    """
    On saving a PrescriptionItem, either create a new Bill (if none exists),
    or add the new item to the existing Bill, then recalculate totals.
    """
    prescription = instance.prescription
    child = prescription.child
    ct_item = ContentType.objects.get_for_model(PrescriptionItem)

    # Attempt to find an existing Bill for this prescription
    # A Bill exists if any BillItem links to any item of this prescription
    existing_bill = Bill.objects.filter(
        items__content_type=ct_item,
        items__object_id__in=prescription.items.values_list('id', flat=True)
    ).distinct().first()

    # Helper to calculate and create a BillItem for a single PrescriptionItem
    def add_item_to_bill(bill, item):
        drug = item.drug
        unit_price = drug.price_per_unit or Decimal('0.00')

        # Compute quantity
        days = item.duration_value
        if item.duration_unit == 'WEEKS':
            days *= 7
        elif item.duration_unit == 'MONTHS':
            days *= 30
        freq_map = {
            'QD': 1, 'BID': 2, 'TID': 3, 'QID': 4,
            'Q4H': 6, 'Q6H': 4, 'Q8H': 3, 'Q12H': 2,
            'PRN': 1, 'STAT': 1, 'AC': 3, 'PC': 3, 'HS': 1,
        }
        daily_qty = freq_map.get(item.frequency, 1)
        quantity = Decimal(days * daily_qty)

        # Compute line total including weight-based dosing
        if item.is_weight_based and prescription.weight_at_prescription and item.dose_per_kg:
            dose = item.calculate_weight_based_dose(prescription.weight_at_prescription)
            administrations = Decimal(daily_qty) * Decimal(days)
            line_total = (dose * administrations) * unit_price
        else:
            line_total = quantity * unit_price

        line_total = line_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

      # Description (simplified for bill PDF)
        drug_info = f"{drug.name} {drug.strength or ''}".strip()
      

        description = f"{drug_info}- Qty: {quantity}".strip()


        BillItem.objects.create(
            bill=bill,
            description=description,
            quantity=quantity,
            unit_price=unit_price,
            amount=line_total,
            content_type=ct_item,
            object_id=item.id
        )

    # Use a transaction for atomicity
    with transaction.atomic():
        if existing_bill:
            # Add only the new item
            logger.debug(f"Adding item {instance.id} to existing Bill #{existing_bill.id}")
            add_item_to_bill(existing_bill, instance)
            existing_bill.save()
            logger.info(f"Updated Bill #{existing_bill.id} total_amount: {existing_bill.total_amount}")
        else:
            # No bill exists: create one and add all items
            logger.debug(f"No existing bill for Prescription {prescription.id}; creating new bill")
            bill = Bill.objects.create(child=child)
            for item in prescription.items.all():
                add_item_to_bill(bill, item)
            bill.save()
            logger.info(f"Auto-created Bill #{bill.id} for Prescription #{prescription.id}, total ${bill.total_amount}")
