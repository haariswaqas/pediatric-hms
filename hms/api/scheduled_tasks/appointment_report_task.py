# your_app/tasks/appointment_report_task.py

from celery import shared_task
import logging
from datetime import datetime, date
from pathlib import Path
from typing import List, Dict, Any
from django.conf import settings

import pandas as pd
import io
import matplotlib.pyplot as plt

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER

from ..models import Appointment, User
from ..tasks import send_email_task  

logger = logging.getLogger(__name__)

REPORT_DIR = Path(settings.BASE_DIR) / "generated_reports"
REPORT_DIR.mkdir(exist_ok=True, parents=True)


def generate_filename(prefix: str) -> Path:
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    return REPORT_DIR / f"{prefix}_{ts}.pdf"


def build_appointment_table_data(appts: List[Appointment]) -> List[List[Any]]:
    header = ["Time", "Parent", "Child", "Doctor", "Reason", "Status"]
    data = [header]
    for a in appts:
        data.append([
            a.appointment_time.strftime("%H:%M") if a.appointment_time else "",
            f"{a.parent.user.first_name} {a.parent.user.last_name}" if a.parent else "N/A",
            f"{a.child.first_name} {a.child.last_name}",
            f"Dr. {a.doctor.user.first_name} {a.doctor.user.last_name}",
            (a.reason[:50] + "...") if len(a.reason)>50 else a.reason,
            a.status,
        ])
    return data


def plot_status_counts(appts: List[Appointment]) -> RLImage:
    # count per status
    df = pd.DataFrame([a.status for a in appts], columns=["status"])
    counts = df["status"].value_counts()
    plt.figure(figsize=(4,2))
    counts.plot.bar()
    plt.title("Appointments by Status")
    plt.xlabel("")
    plt.ylabel("Count")
    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format="PNG")
    plt.close()
    buf.seek(0)
    return RLImage(buf, width=4*inch, height=2*inch)


def plot_hourly_trend(appts: List[Appointment]) -> RLImage:
    # count by hour
    times = [a.appointment_time.hour for a in appts if a.appointment_time]
    df = pd.DataFrame(times, columns=["hour"])
    trend = df["hour"].value_counts().sort_index()
    plt.figure(figsize=(4,2))
    trend.plot.line(marker="o")
    plt.title("Appointments by Hour")
    plt.xlabel("Hour of Day")
    plt.ylabel("Count")
    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format="PNG")
    plt.close()
    buf.seek(0)
    return RLImage(buf, width=4*inch, height=2*inch)


def generate_pdf(appts: List[Appointment], filepath: Path) -> None:
    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=landscape(letter),
        leftMargin=0.3*inch, rightMargin=0.3*inch,
        topMargin=0.5*inch, bottomMargin=0.5*inch
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('title', parent=styles['Heading1'], fontSize=18, alignment=TA_CENTER)
    cell_style = ParagraphStyle('cell', parent=styles['Normal'], fontSize=8, leading=10)

    elements = [
        Paragraph("Daily Appointment Report", title_style),
        Paragraph(f"Date: {date.today().strftime('%B %d, %Y')}", styles['Heading3']),
        Spacer(1, 0.2*inch)
    ]

    # Charts side by side
    status_img = plot_status_counts(appts)
    trend_img = plot_hourly_trend(appts)
    elements.append(status_img)
    elements.append(Spacer(1,0.1*inch))
    elements.append(trend_img)
    elements.append(Spacer(1,0.2*inch))

    # Table
    table_data = build_appointment_table_data(appts)
    col_widths = [1*inch, 1.5*inch, 1.5*inch, 1.5*inch, 3*inch, 1*inch]
    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    style = TableStyle([
        ('BACKGROUND',(0,0),(-1,0),colors.darkblue),
        ('TEXTCOLOR',(0,0),(-1,0),colors.whitesmoke),
        ('ALIGN',(0,0),(-1,0),'CENTER'),
        ('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),
        ('FONTSIZE',(0,0),(-1,0),10),
        ('GRID',(0,0),(-1,-1),0.25,colors.grey),
        ('VALIGN',(0,1),(-1,-1),'TOP'),
        ('FONTSIZE',(0,1),(-1,-1),8),
        ('LEFTPADDING',(0,1),(-1,-1),3),
        ('RIGHTPADDING',(0,1),(-1,-1),3),
    ])
    # alternating rows
    for i in range(1,len(table_data)):
        bg = colors.whitesmoke if i%2 else colors.lightgrey
        style.add('BACKGROUND',(0,i),(-1,i),bg)
    table.setStyle(style)

    elements.append(KeepTogether(table))

    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica',7)
        canvas.drawCentredString(doc.pagesize[0]/2, 0.3*inch,
            f"Page {canvas.getPageNumber()} – Appointments")
        canvas.restoreState()

    doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
    logger.info(f"Appointment PDF generated at {filepath}")


@shared_task
def generate_and_send_appointment_report():
    # fetch today's appointments
    today = date.today()
    appts = list(Appointment.objects.filter(appointment_date=today))
    if not appts:
        logger.info("No appointments today; skipping report.")
        return

    pdf_path = generate_filename("appointments")
    generate_pdf(appts, pdf_path)

    # send to all admins
    admin_emails = list(User.objects.filter(role='admin').values_list('email', flat=True))
    subject = "Daily Appointment Report"
    message = "Please find attached today's appointment report."
    send_email_task.delay(subject, message, admin_emails, attachments=[str(pdf_path)])
    logger.info(f"Sent appointment report to admins: {admin_emails}")

from django.utils import timezone
from datetime import datetime
from ..notifications import create_notification_task
@shared_task
def auto_complete_appointments():
    """
    Find every CONFIRMED appointment whose date+time is now in the past,
    mark it COMPLETED, and (optionally) notify parent & doctor.
    Returns list of IDs that were updated.
    """
    now = timezone.now()
    updated_ids = []
    qs = Appointment.objects.filter(status="CONFIRMED")
    for appt in qs:
        # combine date + time into a timezone‑aware datetime
        appt_dt = datetime.combine(appt.appointment_date, appt.appointment_time)
        appt_dt = timezone.make_aware(appt_dt, timezone.get_current_timezone())

        if appt_dt <= now:
            appt.status = "COMPLETED"
            appt.save()
            updated_ids.append(appt.id)

            # notify parent
            if appt.parent:
                msg = f"Your appointment on {appt.appointment_date} at {appt.appointment_time} is now completed."
                create_notification_task.delay(appt.parent.user.id, msg)

            # notify doctor
            doc_user = appt.doctor.user
            create_notification_task.delay(doc_user.id,
                f"Appointment {appt.id} has been auto‑completed.")

    return updated_ids