from celery import shared_task
import logging
from api.reports.services import generate_report
from api.reports.utils import ReportTypeEnum, FileFormat, get_doctor_and_nurse_recipients
from typing import List, Optional
from ..tasks import create_notification_task

logger = logging.getLogger(__name__)
@shared_task
def generate_admission_report(
    file_format: str = FileFormat.PDF.value,
    recipients: Optional[List[str]] = None
) -> None:
    logger.info("=== ADMISSION REPORT GENERATION STARTED ===")

    try:
        users = get_doctor_and_nurse_recipients()  # Get User instances
        emails = [user.email for user in users]    # Extract emails for emailing

        result = generate_report(
            report_type=ReportTypeEnum.ADMISSION,
            file_format=file_format,
            recipients=emails,
            users_with_access=users
        )

        if result:
            path, report_obj = result
            logger.info(f"ADMISSION report generated: {path} (DB id={report_obj.id})")

            message = f"New admission report (ID: {report_obj.id}) has been generated and is available."
            for user in users:
                create_notification_task.delay(user.id, message)
        else:
            logger.info("NO ADMISSION REPORT TO GENERATE")
    except Exception:
        logger.exception("Error generating ADMISSION report")

    logger.info("=== ADMISSION REPORT GENERATED SUCCESSFULLY ===")


 
@shared_task
def generate_discharge_report(file_format: str = FileFormat.PDF.value, recipients: Optional[List[str]] = None) -> None:
    """
    Celery task to generate discharge report.

    Args:
        file_format: Format of the report file
        recipients: List of email recipients (optional)
    """
    logger.info("=== DISCHARGE REPORT GENERATION STARTED ===")

    try:
        result = generate_report(ReportTypeEnum.DISCHARGE, file_format, recipients)
        if result:
            filepath, report_obj = result
            logger.info(f"Discharge report generated successfully: {filepath} (DB ID: {report_obj.id})")
        else:
            logger.info("No discharges found today.")

    except Exception as e:
        logger.error(f"Error generating discharge report: {str(e)}")

    logger.info("=== DISCHARGE REPORT COMPLETED ===")
    
    