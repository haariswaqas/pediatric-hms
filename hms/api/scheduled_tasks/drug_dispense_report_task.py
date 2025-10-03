from celery import shared_task
import logging
from ..reports.utils import FileFormat, ReportTypeEnum, get_pharmacist_recipients
from ..reports.services import generate_report

logger = logging.getLogger(__name__)
@shared_task
def generate_drug_dispense_report(
    file_format: str = FileFormat.PDF.value,
      recipients: list[str] | None = None
) -> None:
    logger.info("=== DRUG DIISPENSE REPORT GENERATION STARTED")
    
    try:
        users = get_pharmacist_recipients()  # Get User instances
        emails = [user.email for user in users]    
        
        result = generate_report(
            report_type=ReportTypeEnum.DRUG_DISPENSE_RECORDS, 
            file_format=file_format,
            recipients=emails, 
            users_with_access=users
        )
        if result:
            path, report_obj = result
            logger.info(f"DRUG DISPENSE report generated: {path} (DB id={report_obj.id})")

        else:
            logger.info("NO DRUG DISPENSE REPORT TO GENERATE")
    except Exception:
        logger.exception("error generating prescription report")
    logger.info("=== DRUG DISPENSE REPORT GENERATED SUCCESSFULLY")
 