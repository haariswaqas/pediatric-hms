from celery import shared_task
import logging
from api.reports.services import generate_report
from api.reports.utils import ReportTypeEnum, FileFormat, get_labtech_recipients, get_requested_by_user_for_request, get_requested_by_email_for_request
from typing import List, Optional
from ..tasks import create_notification_task

logger = logging.getLogger(__name__)

@shared_task
def generate_lab_report(request_id: str, file_format: str = FileFormat.PDF.value, recipients: Optional[List[str]] = None) -> None:
    """
    Celery task to generate a lab report for a specific request.

    Args:
        request_id: The ID of the lab request.
        file_format: Format of the report file.
        recipients: List of email recipients (optional).
    """
    logger.info(f"=== LAB REPORT GENERATION STARTED for request_id {request_id} ===")

    try:
        # Get lab technicians
        lab_users = get_labtech_recipients()
        
        
        # Get the user who requested the lab result
        requested_by_user = get_requested_by_user_for_request(request_id)

        if not requested_by_user:
            logger.warning(f"No requesting user found for request_id: {request_id}. Aborting.")
            return

        # Combine lab technicians and the requesting doctor for users_with_access
        users_with_access = list(lab_users)
        if requested_by_user not in users_with_access:
            users_with_access.append(requested_by_user)

        final_recipients = recipients if recipients is not None else [requested_by_user.email]

        result = generate_report(
            report_type=ReportTypeEnum.LAB_REPORT,
            file_format=file_format,
            recipients=final_recipients,
            request_id=request_id, 
            users_with_access=users_with_access  # Now includes both lab techs and requesting doctor
        )

        if result:
            path, report_obj = result
            logger.info(f"LAB report generated successfully: {path} (DB ID: {report_obj.id})")

            message = f"New lab report (ID: {report_obj.id}) has been generated and is available."
            # In this case, we assume we only have one recipient (the requested_by user).
            if final_recipients:
                for email in final_recipients:
                    create_notification_task.delay(email, message)

        else:
            logger.info(f"No lab results found for request_id: {request_id}")

    except Exception:
        logger.exception(f"Error generating LAB report for request_id: {request_id}")

    logger.info(f"=== LAB REPORT GENERATION COMPLETED for request_id {request_id} ===")