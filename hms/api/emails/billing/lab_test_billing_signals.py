# billing/lab_test_billing_signals.py
from decimal import Decimal, ROUND_HALF_UP
import logging

from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType

from ...models import Bill, BillItem,  LabRequestItem


logger = logging.getLogger(__name__)


@receiver(post_save, sender=LabRequestItem)
def create_or_update_bill_for_lab_request(sender, instance, created, **kwargs):
    """
    On saving a LabRequestItem, create or update a Bill for its parent LabRequest.
    """
    lab_request = instance.lab_request
    child = lab_request.child  # adjust attribute if different (e.g., patient)
    ct_item = ContentType.objects.get_for_model(LabRequestItem)

    # Find existing Bill linked to this LabRequest via test_items
    existing_bill = Bill.objects.filter(
        items__content_type=ct_item,
        items__object_id__in=lab_request.test_items.values_list('id', flat=True)
    ).distinct().first()

    def add_item_to_bill(bill, item):
        lab_test = item.lab_test
        unit_price = lab_test.price or Decimal('0.00')

        # Quantity default to 1 unless specified on item
        quantity = getattr(item, 'quantity', 1)
        quantity = Decimal(str(quantity))

        # Compute line total
        line_total = (unit_price * quantity).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        # Description
        description = f"{lab_test.name} (Test) - Qty: {quantity}"

        BillItem.objects.create(
            bill=bill,
            description=description,
            quantity=quantity,
            unit_price=unit_price,
            amount=line_total,
            content_type=ct_item,
            object_id=item.id
        )

    with transaction.atomic():
        if existing_bill:
            logger.debug(f"Adding LabRequestItem {instance.id} to Bill #{existing_bill.id}")
            add_item_to_bill(existing_bill, instance)
            existing_bill.save()
            logger.info(f"Updated Bill #{existing_bill.id}, new total {existing_bill.total_amount}")
        else:
            logger.debug(f"Creating new bill for LabRequest {lab_request.id}")
            bill = Bill.objects.create(child=child)
            for item in lab_request.test_items.all():
                add_item_to_bill(bill, item)
            bill.save()
            logger.info(f"Auto-created Bill #{bill.id} for LabRequest #{lab_request.id}, total {bill.total_amount}")
