from celery import shared_task
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any
from django.conf import settings
import pandas as pd
import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer,
    KeepTogether, Image as RLImage
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER

import matplotlib.pyplot as plt

from ..models import AdmissionVitalRecord, AdmissionVitalRecordHistory, User
from ..tasks import send_email_task  # your existing email‐sending Celery task

logger = logging.getLogger(__name__)

REPORT_DIR = Path(settings.BASE_DIR) / "generated_reports"
REPORT_DIR.mkdir(exist_ok=True, parents=True)


def generate_vitals_filename(avr_id: int) -> Path:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return REPORT_DIR / f"vitals_history_{avr_id}_{timestamp}.pdf"


def build_vitals_history_data(histories: List[AdmissionVitalRecordHistory]) -> List[List[Any]]:
    cols = [
        "Recorded At", "Temperature (°C)", "Heart Rate", "BP", "Resp Rate",
        "O₂ Sat", "Head Circumf. (cm)", "Capillary Refill (s)",
        "Pain Score", "Consciousness", "Glucose", "Hydration", "Taken By"
    ]
    data = [cols]
    for h in histories:
        data.append([
            h.updated_at.strftime("%Y-%m-%d %H:%M"),
            float(h.temperature),
            int(h.heart_rate),
            h.blood_pressure,
            int(h.respiratory_rate),
            h.oxygen_saturation or 0,
            float(h.head_circumference or 0),
            float(h.capillary_refill or 0),
            int(h.pain_score or 0),
            h.consciousness_level or "N/A",
            float(h.glucose_level or 0),
            h.hydration_status or "N/A",
            f"{h.updated_by.username}" if h.updated_by else "System",
        ])
    return data


def plot_vitals(histories: List[AdmissionVitalRecordHistory]) -> List[RLImage]:
    """Generate line plots for numeric vitals and return them as ReportLab Image objects."""
    # Build a DataFrame for easier plotting
    df = pd.DataFrame([{
        'time': h.updated_at,
        'temperature': float(h.temperature),
        'heart_rate': int(h.heart_rate),
        'respiratory_rate': int(h.respiratory_rate),
        'oxygen_saturation': h.oxygen_saturation or 0
    } for h in histories]).set_index('time').sort_index()

    images = []
    for metric, ylabel in [
        ('temperature', 'Temperature (°C)'),
        ('heart_rate', 'Heart Rate (bpm)'),
        ('respiratory_rate', 'Respiratory Rate (breaths/min)'),
        ('oxygen_saturation', 'O₂ Saturation (%)'),
    ]:
        plt.figure(figsize=(6,2))
        plt.plot(df.index, df[metric], marker='o', linestyle='-')
        plt.title(ylabel)
        plt.xlabel('Time')
        plt.ylabel(ylabel)
        plt.grid(True)
        buf = io.BytesIO()
        plt.tight_layout()
        plt.savefig(buf, format='PNG')
        plt.close()
        buf.seek(0)
        # Embed with width equal to doc width minus margins
        img = RLImage(buf, width=6*inch, height=1.5*inch)
        images.append(img)
    return images


def generate_vitals_pdf(data: List[List[Any]], histories: List[AdmissionVitalRecordHistory], filepath: Path) -> None:
    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=landscape(letter),
        leftMargin=0.3*inch, rightMargin=0.3*inch,
        topMargin=0.5*inch, bottomMargin=0.5*inch,
        title="Vitals History"
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('title', parent=styles['Heading1'], fontSize=18, alignment=TA_CENTER)
    cell_style = ParagraphStyle('cell', parent=styles['Normal'], fontSize=8, leading=10)

    elements = [
        Paragraph("Vitals History Report", title_style),
        Spacer(1, 0.2*inch)
    ]

    # Insert plots
    for img in plot_vitals(histories):
        elements.append(img)
        elements.append(Spacer(1, 0.1*inch))

    # Build table data as Paragraphs
    wrapped = []
    for row in data:
        wrapped.append([Paragraph(str(cell), cell_style) for cell in row])

    # Compute column widths equally
    total_w = doc.width
    col_widths = [total_w/len(data[0])]*len(data[0])

    table = Table(wrapped, colWidths=col_widths, repeatRows=1)
    style = TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#3498db')),
        ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
        ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
        ('ALIGN',(0,0),(-1,0),'CENTER'),
        ('GRID', (0,0), (-1,-1), 0.25, colors.grey),
        ('VALIGN',(0,1),(-1,-1),'TOP'),
        ('FONTSIZE',(0,1),(-1,-1),8),
        ('LEFTPADDING',(0,1),(-1,-1),3),
        ('RIGHTPADDING',(0,1),(-1,-1),3),
    ])
    for i in range(1, len(wrapped)):
        bg = colors.whitesmoke if i%2 else colors.lightgrey
        style.add('BACKGROUND', (0,i),(-1,i), bg)
    table.setStyle(style)

    elements.append(KeepTogether(table))

    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 7)
        canvas.drawCentredString(doc.pagesize[0]/2, 0.3*inch,
            f"Page {canvas.getPageNumber()} – Vitals History")
        canvas.restoreState()

    doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
    logger.info(f"PDF generated at {filepath}")


@shared_task
def send_vitals_history_report(avr_id: int) -> None:
    try:
        avr = AdmissionVitalRecord.objects.select_related(
            "admission__child__primary_guardian__user"
        ).get(id=avr_id)
    except AdmissionVitalRecord.DoesNotExist:
        logger.error(f"AdmissionVitalRecord {avr_id} not found.")
        return

    histories = list(avr.history.all().order_by("updated_at"))
    if not histories:
        logger.info(f"No history for AVR {avr_id}; skipping PDF.")
        return

    data = build_vitals_history_data(histories)
    pdf_path = generate_vitals_filename(avr_id)
    generate_vitals_pdf(data, histories, pdf_path)

    doctor = avr.admission.attending_doctor
    email = doctor.user.email
    if not email:
        logger.error(f"No email for guardian of child {avr.admission.child.id}")
        return

    subject = "Patient Vital History"
    message = f"Dear {doctor.first_name} {doctor.last_name} ({doctor.user.username}), please find attached the vitals history report for your child."
    send_email_task.delay(subject, message, [email], attachments=[str(pdf_path)])
    logger.info(f"Sent vitals history PDF to parent {email}")
