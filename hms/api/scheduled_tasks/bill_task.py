from celery import shared_task
import logging
from api.reports.services import generate_report
from api.reports.utils import ReportTypeEnum, FileFormat, get_parent, get_default_recipients
from typing import List, Optional
from ..tasks import create_notification_task

logger = logging.getLogger(__name__)

@shared_task
def generate_bill_by_bill_number(bill_number: str, file_format: str = FileFormat.PDF.value, recipients: Optional[List[str]] = None) -> None:
    """
    Celery task to generate a bill based on the bill_number.

    Args:
        bill_number: The number (or id or unique identifer) of the specific bill which will contain various bill items.
        
        file_format: Format of the bill file.
        recipients: List of email recipients (optional).
    """
    logger.info(f"=== BILL GENERATION STARTED for bill_number {bill_number} ===")
    try:
        # get admins
        admin_users = get_default_recipients()
        
        # get the parent of the child
        parent_info = get_parent(bill_number)
        if not parent_info:
            logger.warning("No parent found for bill number {bill_number}")
            return

        parent_id, parent_email = parent_info

        # combine admins and parent email
        users_with_access = list(admin_users)
        if parent_email not in users_with_access:
            users_with_access.append(parent_email)

        final_recipients = recipients if recipients is not None else [parent_email]

        
        result = generate_report(
            report_type=ReportTypeEnum.BILL,
            file_format=file_format,
            recipients=final_recipients,
            bill_number=bill_number, 
            users_with_access=users_with_access
        )

        if result:
            path, report_obj = result
            logger.info(f"Bill generated successfully: {path} (DB ID: {report_obj.id})")
            message = f"New Bill (NUMBER: {report_obj.id}) has been generated and is available"
            if final_recipients:
                for email in final_recipients:
                    create_notification_task.delay(email, message)
        else: 
            logger.info(f"No bill items found for the bill with bill_number: {bill_number}")
    except Exception:
        logger.exception(f"ERROR generating Bill for bill_number {bill_number}")
    logger.info(f"=== BILL GENERATION COMPLETED FOR BILL_NUMBER {bill_number}")