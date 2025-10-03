from celery import shared_task
import logging
from datetime import datetime
from pathlib import Path
import pandas as pd
from typing import List, Dict, Any, Optional
from ..models import User, AdmissionRecord, VaccinationRecord
from ..tasks import send_email_task
from django.conf import settings
from django.db.models import QuerySet
from enum import Enum, auto

# PDF Generation imports (same as before)…
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.pdfgen import canvas
from ..reports.utils import FileFormat, ReportTypeEnum, get_doctor_and_nurse_recipients
from ..reports.services import generate_report


# api/scheduled_tasks/vaccination_records_task.py

logger = logging.getLogger(__name__)

@shared_task
def generate_vaccination_report(
    file_format: str = FileFormat.PDF.value,
    recipients: list[str] | None = None
) -> None:
   
    logger.info("=== VACCINATION REPORT GENERATION STARTED ===")
    try:
        users = get_doctor_and_nurse_recipients()  # Get User instances
        emails = [user.email for user in users] 
        result = generate_report(
            report_type=ReportTypeEnum.ALL_VACCINATION_RECORDS,
            file_format=file_format,
            recipients=emails,
            users_with_access=users
        )
        if result:
            path, report_obj = result
            logger.info(f"Vaccination report generated: {path} (DB id={report_obj.id})")
        else:
            logger.info("No vaccination records to report.")
    except Exception:
        logger.exception("Error generating vaccination report")
    logger.info("=== VACCINATION REPORT GENERATION COMPLETED ===")
