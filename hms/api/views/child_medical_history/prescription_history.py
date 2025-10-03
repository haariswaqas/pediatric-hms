from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from .pdf import *

def prescription_history(child, styles, story):
    """Append the prescription section for the given child to the PDF story."""
    prescriptions = child.prescriptions_received.all().order_by("-date_prescribed")
    story.append(Spacer(1, 0.1 * inch))

    if prescriptions.exists():
        # Enhanced summary info
        total_prescriptions = prescriptions.count()
        story.append(Paragraph(
            f"<b>Summary:</b> {total_prescriptions} total prescriptions",
            styles['Detail']
        ))
        story.append(Spacer(1, 0.15 * inch))

        # Table header
        data = [["Date", "Diagnosis", "Medication (Strength)", "Dosage", "Schedule", "Prescribed By"]]

        for p in prescriptions:
            doctor_name = (
                f"Dr. {p.doctor.first_name} {p.doctor.last_name}"
                if p.doctor else "N/A"
            )

            if p.items.exists():
                for i, item in enumerate(p.items.all()):
                    # Show drug with strength in same column
                    drug_display = (
                        f"{item.drug.name} ({item.drug.strength})"
                        if getattr(item.drug, "strength", None)
                        else item.drug.name
                    )

                    # Handle duration (singular/plural fix)
                    duration_value, duration_unit = item.duration_value, item.duration_unit
                    if duration_value == 1:
                        duration_text = f"1 {duration_unit.rstrip('s')}"
                    else:
                        duration_text = f"{duration_value} {duration_unit}"

                    schedule = f"{item.get_frequency_display()} for {duration_text}"

                    # Only show date, diagnosis, and doctor once per prescription
                    date_display = p.date_prescribed.strftime('%Y-%m-%d') if i == 0 else ""
                    diagnosis_display = str(p.diagnosis.title) if (i == 0 and p.diagnosis) else ("N/A" if i == 0 else "")
                    doctor_display = doctor_name if i == 0 else ""

                    data.append([
                        date_display,
                        diagnosis_display,
                        drug_display,
                        item.dosage,
                        schedule,
                        doctor_display
                    ])
            else:
                # Prescription with no items
                data.append([
                    p.date_prescribed.strftime('%Y-%m-%d'),
                    str(p.diagnosis) if p.diagnosis else "N/A",
                    "No medications specified",
                    "—",
                    "—",
                    doctor_name
                ])

        # Create styled table
        table = Table(data, colWidths=[0.9*inch, 1.2*inch, 1.8*inch, 0.8*inch, 1.6*inch, 1.4*inch])
        table.setStyle(TableStyle([
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), BrandColors.PRIMARY),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            # Data styling
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            # Grid and padding
            ('GRID', (0, 0), (-1, -1), 0.5, BrandColors.PRIMARY),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            # Alternating row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BrandColors.LIGHT_BG]),
        ]))

        story.append(table)
    else:
        story.append(Paragraph(
            "📋 No prescription history available for this patient.",
            styles['Detail']
        ))

    story.append(Spacer(1, 0.2 * inch))