from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from .pdf import *
from ...models import Treatment

def treatment_history(child, styles, story):
    """Append the treatment history section for the given child to the PDF story."""
    # Get all treatments linked to child diagnoses
    treatments = Treatment.objects.filter(diagnosis__child=child).order_by("-created_at")

    
    story.append(Spacer(1, 0.1 * inch))

    if treatments.exists():
        total_treatments = treatments.count()
        story.append(Paragraph(
            f"<b>Summary:</b> {total_treatments} total treatments",
            styles['Detail']
        ))
        story.append(Spacer(1, 0.15 * inch))

        # Table header
        data = [["Date", "Treatment Title", "Description", "Diagnosis"]]

        for t in treatments:
            date_display = t.created_at.strftime("%Y-%m-%d %H:%M")
            diagnosis_title = t.diagnosis.title if t.diagnosis else "N/A"

            data.append([
                date_display,
                t.title,
                t.description,
                diagnosis_title
            ])

        table = Table(data, colWidths=[1.1*inch, 1.6*inch, 2.6*inch, 1.6*inch])
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
            "💊 No treatment history available for this patient.",
            styles['Detail']
        ))

    story.append(Spacer(1, 0.2 * inch))