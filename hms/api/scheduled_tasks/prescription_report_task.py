# api/scheduled_tasks/vaccination_records_task.py

from celery import shared_task
import logging
from ..reports.utils import FileFormat, ReportTypeEnum, get_pharmacist_recipients
from ..reports.services import generate_report


from django.utils import timezone
from ..models import Prescription
from ..tasks import create_notification_task

logger = logging.getLogger(__name__)
@shared_task
def generate_prescription_report(
    file_format: str = FileFormat.PDF.value,
      recipients: list[str] | None = None
) -> None:
    logger.info("=== PRESCRIPITON REPORT GENERATION STARTED")
    
    try:
        users = get_pharmacist_recipients()  # Get User instances
        emails = [user.email for user in users] 
        result = generate_report(
            report_type=ReportTypeEnum.PRESCRIPTION_RECORDS, 
            file_format=file_format,
            recipients=emails, 
            users_with_access=users
        )
        if result:
            path, report_obj = result
            logger.info(f"Prescription report generated: {path} (DB id={report_obj.id})")

        else:
            logger.info("NO PRESCRIPTION REPORT TO GENERATE")
    except Exception:
        logger.exception("error generating prescription report")
    logger.info("=== PRESCRIPTION REPORT GENERATED SUCCESSFULLY")
 
@shared_task    
def generate_prescription_spreadsheet(
    file_format: str = FileFormat.CSV.value,
    recipients: list[str] | None = None
) -> None:
    logger.info("PRESCRIPTION SPREADHSHEET GENERATION STARTED")
    
    try:
        result = generate_report(
            report_type=ReportTypeEnum.PRESCRIPTION_RECORDS,
            file_format=file_format,
            recipients=get_pharmacist_recipients()
        )
        if result: 
            path, report_obj = result
            logger.info(f"Prescription spreadsheet generated: {path} DB id = {report_obj.id}")
        else:
            logger.info("NO PRESCRIPTION SPREADHSHEET GENERATE")
    except Exception:
        logger.exception("error generating prescription spreadsheet")
    logger.info("PRESCRIPTION SPREADHSHEET GENERATED!")


@shared_task
def auto_expire_prescriptions():
    now = timezone.now().date() 
    expired_prescriptions = []
    pending_prescriptions = Prescription.objects.filter(status="PENDING")
    for prescription in pending_prescriptions:
        prescription_valid_until = prescription.valid_until
        if prescription_valid_until <= now:
            prescription.status = "EXPIRED"
            prescription.save()
            expired_prescriptions.append(prescription.id)
            doctor = prescription.doctor.user
            parent = prescription.child.primary_guardian.user
            if parent:
                message = f"Your pending prescription has expired"
                create_notification_task.delay(
                    parent.id, message
                )
            create_notification_task.delay(
                doctor.id, f"Your prescription for {prescription.child.first_name} {prescription.child.last_name} has expired"
                
            )
    return expired_prescriptions

@shared_task
def auto_complete_prescriptions():
    now = timezone.now().date()
    completed_prescriptions = []
    active_prescriptions = Prescription.objects.filter(status="ACTIVE")
    for prescription in active_prescriptions:
        prescription_valid_until = prescription.valid_until
        if prescription_valid_until <= now:
            prescription.status = "COMPLETED"
            prescription.save()
            completed_prescriptions.append(prescription.id)
            doctor = prescription.doctor.user
            parent = prescription.child.primary_guardian.user
            if parent:
                message = f"Your active prescription is now complete"
                create_notification_task.delay(
                    parent.id, message
                )
            create_notification_task.delay(
                doctor.id, f"Your prescription for {prescription.child.first_name} {prescription.child.last_name} is complete"
                
            )
    return completed_prescriptions
            