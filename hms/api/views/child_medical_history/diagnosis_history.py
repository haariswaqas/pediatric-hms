from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from .pdf import *

def diagnosis_history(child, styles, story):
    """Append the diagnosis history section for the given child to the PDF story."""
    diagnoses = child.diagnoses.all().order_by("-date_diagnosed")

   
    story.append(Spacer(1, 0.1 * inch))

    if diagnoses.exists():
        total_diagnoses = diagnoses.count()
        story.append(Paragraph(
            f"<b>Summary:</b> {total_diagnoses} total diagnoses",
            styles['Detail']
        ))
        story.append(Spacer(1, 0.15 * inch))

        # Table header
        data = [["Date", "Title", "ICD Code", "Status", "Severity", "Doctor"]]

        for d in diagnoses:
            doctor_name = f"Dr. {d.doctor.first_name} {d.doctor.last_name}" if d.doctor else "N/A"
            date_display = d.date_diagnosed.strftime("%Y-%m-%d %H:%M")
            icd_code = d.icd_code if d.icd_code else "—"
            severity = d.severity if d.severity else "—"

            data.append([
                date_display,
                d.title,
                icd_code,
                d.get_status_display(),
                severity,
                doctor_name
            ])

        table = Table(data, colWidths=[1.1*inch, 1.6*inch, 0.8*inch, 1.0*inch, 1.0*inch, 1.6*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), BrandColors.PRIMARY),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, BrandColors.PRIMARY),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BrandColors.LIGHT_BG]),
        ]))

        story.append(table)
    else:
        story.append(Paragraph(
            "🩺 No diagnosis history available for this patient.",
            styles['Detail']
        ))

    story.append(Spacer(1, 0.2 * inch))