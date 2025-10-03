# api/reports/services.py
from .utils import ReportTypeEnum, FileFormat, get_default_recipients, get_default_users, generate_filename
from .data import build_report_data, write_report_file
import os
import logging
from django.utils import timezone
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from django.core.files import File
from pathlib import Path
from ..models import User, Report, AdmissionRecord, VaccinationRecord, PrescriptionItem, DrugDispenseRecord, LabResultParameter, Bill
from ..tasks import send_email_task

logger=logging.getLogger(__name__)

def save_report_to_db(
    filepath: Path, 
    report_type: str, 
    file_format: str,
    title: str,
    record_count: int,
    users: Optional[List[User]] = None
) -> Report:
    """
    Save report to database for in-app access
    
    Args:
        filepath: Path to the report file
        report_type: Type of report (admission or discharge)
        file_format: Format of the report file
        title: Report title
        record_count: Number of records in the report
        users: List of users who should have access to the report
        
    Returns:
        Report model instance
    """
    logger.info(f"[DEBUG] save_report_to_db called with filepath={filepath}, report_type={report_type}, format={file_format}, count={record_count}")
    try:
        with open(filepath, 'rb') as f:
            report = Report(
                title=title,
                report_type=report_type,
                format=file_format,
                record_count=record_count
            )
            report.file.save(os.path.basename(filepath), File(f), save=True)
            if users:
                report.users.add(*users)
            else:
                report.users.add(*get_default_users())
            report.save()
        logger.info(f"[DEBUG] Report saved to database: id={report.id}")
        return report

    except Exception as e:
        logger.error(f"[ERROR] save_report_to_db failed: {e}", exc_info=True)
        raise


def send_report_via_email(
    filepath: Path,
    report_name: str,
    report_obj: Report = None,
    recipients: Optional[List[str]] = None
) -> None:
    """
    Send report file via email.

    Args:
        filepath: Path to the report file
        report_name: Name of the report for the subject and message
        report_obj: Report model instance (optional)
        recipients: List of email recipients (optional)
    """
    if not filepath.exists():
        logger.error(f"File not found: {filepath}")
        raise FileNotFoundError(f"Report file does not exist: {filepath}")

    subject = f"{report_name} - {datetime.now().date()}"
    message = f"Please find attached the {report_name.lower()} for {datetime.now().strftime('%B %d, %Y')}."
    
    # Add link to view in app if report_obj exists
    if report_obj:
        message += f"\n\nYou can also view this report in the application."

    try:
        recipient_list = recipients
        send_email_task.delay(subject, message, recipient_list, attachments=[str(filepath)])
        
        # Update report email status if a report object was provided
        if report_obj:
            report_obj.emailed = True
            report_obj.emailed_at = timezone.now()
            report_obj.save()
        
        logger.info(f"Email sent with {report_name} to {recipient_list}")
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise

def generate_report(
    report_type: ReportTypeEnum,
    file_format: str = FileFormat.CSV.value,
    recipients: Optional[List[str]] = None,
    users_with_access: Optional[List[User]] = None, 
    request_id: Optional[str] = None
) -> Optional[Tuple[Path, Report]]:
    """
    Generate and send a report.

    Args:
        report_type: Type of report (admission or discharge)
        file_format: Format of the report file
        recipients: List of email recipients (optional)
        users_with_access: Users to be assigned access to the report in-app
        
    Returns:
        Tuple containing path of the generated report file and Report object, 
        or None if no records found
    """
    current_date = datetime.now().date()

    # Get records based on report type
    if report_type == ReportTypeEnum.ADMISSION:
        records = AdmissionRecord.objects.filter(admission_date__date=current_date)
        report_name = "Admission Report"
        prefix = "admission"
        db_report_type = "admission"
    elif report_type == ReportTypeEnum.DISCHARGE:
        records = AdmissionRecord.objects.filter(discharge_date__date=current_date)
        report_name = "Discharge Report"
        prefix = "discharge"
        db_report_type = "discharge"
    elif report_type == ReportTypeEnum.PRESCRIPTION_RECORDS:
        records = PrescriptionItem.objects.all()
        report_name = "Prescription Records"
        prefix = "prescription"
        db_report_type = "prescription"
    elif report_type == ReportTypeEnum.ALL_VACCINATION_RECORDS:
        records = VaccinationRecord.objects.all()
        report_name = "Vaccination Records"
        prefix = "vaccination"
        db_report_type = "vaccination"
    elif report_type == ReportTypeEnum.DRUG_DISPENSE_RECORDS:
        records = DrugDispenseRecord.objects.all()
        report_name = "Drug Dispense Records"
        prefix = "drug-dispense"
        db_report_type = "drug-dispense"
  
    # For bills, we usually generate for a specific bill number
    elif report_type == ReportTypeEnum.BILL:
    # Get all bills (or filter by a date if desired)
        records = Bill.objects.all().prefetch_related('items', 'child')
        
        if not records.exists():
            logger.info("No bills found")
            return None

        report_data = [build_report_data(bill.bill_number, report_type) for bill in records]
        report_name = "Bill Report"
        prefix = "bill"
        db_report_type = "bill"
        
        filepath = generate_filename(prefix, file_format)
        
        if file_format == FileFormat.PDF.value:
            from .bill_pdf import generate_bill_pdf
            # For PDF, generate a separate file per bill or concatenate in one? 
            # Here we just generate one PDF for the first bill as example
            generate_bill_pdf(report_data[0], filepath)
        else:
            write_report_file(report_data, filepath, file_format)

        report_title = f"{report_name} - {datetime.now().strftime('%Y-%m-%d')}"
        report_obj = save_report_to_db(
            filepath=filepath,
            report_type=db_report_type,
            file_format=file_format,
            title=report_title,
            record_count=len(report_data),
            users=users_with_access
        )

        send_report_via_email(filepath, report_name, report_obj, recipients)
        return filepath, report_obj
    elif report_type == ReportTypeEnum.LAB_REPORT:
        if request_id:
            records = LabResultParameter.objects.filter(
                lab_result__lab_request_item__lab_request__request_id=request_id
        )
        else:
            records = LabResultParameter.objects.all()
        report_name = "Lab Report"
        prefix = "lab-report"
        db_report_type = "lab-report"

    else:
        raise ValueError(f"Invalid report type: {report_type}")

    if not records.exists():
        logger.info(f"No {report_name.lower()} records found for {current_date}")
        return None

    try:
        report_data = build_report_data(records, report_type)
        filepath = generate_filename(prefix, file_format)
        write_report_file(report_data, filepath, file_format)

        report_title = f"{report_name} - {current_date.strftime('%Y-%m-%d')}"
        report_obj = save_report_to_db(
            filepath=filepath,
            report_type=db_report_type,
            file_format=file_format,
            title=report_title,
            record_count=len(report_data),
            users=users_with_access  # pass actual user instances here
        )

        send_report_via_email(filepath, report_name, report_obj, recipients)
        return filepath, report_obj

    except Exception as e:
        logger.error(f"Failed to generate {report_name.lower()}: {str(e)}")
        raise