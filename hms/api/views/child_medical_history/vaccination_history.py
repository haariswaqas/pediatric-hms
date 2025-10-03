from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from .pdf import *

def vaccination_history(child, styles, story):
    """Append the vaccination history section for the given child to the PDF story."""
    vaccinations = child.vaccinations_received.all().order_by("-scheduled_date")

    if vaccinations.exists():
        # Enhanced summary info
        total_vaccines = vaccinations.count()
        completed_vaccines = vaccinations.filter(status='completed').count()
        pending_vaccines = vaccinations.filter(status='scheduled').count()
        
        story.append(Paragraph(
            f"<b>Summary:</b> {completed_vaccines}/{total_vaccines} completed | {pending_vaccines} pending", 
            styles['Detail']
        ))
        story.append(Spacer(1, 0.1*inch))

        # Enhanced table with professional styling
        data = [["Vaccine", "Dose #", "Scheduled Date", "Administered Date", "Status", "Notes"]]
        
        for record in vaccinations:
            # Determine status color and display
            status_display = record.status.title()
            notes = getattr(record, 'notes', '') or getattr(record, 'batch_number', '') or "—"
            
            data.append([
                record.vaccine.name,
                f"Dose {record.dose_number}",
                record.scheduled_date.strftime("%Y-%m-%d"),
                record.administered_date.strftime("%Y-%m-%d") if record.administered_date else "Pending",
                status_display,
                notes[:30] + "..." if len(notes) > 30 else notes
            ])

        # Create professionally styled table
        table = Table(data, colWidths=[1.5*inch, 0.8*inch, 1.0*inch, 1.2*inch, 0.9*inch, 1.1*inch])
        table.setStyle(TableStyle([
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
        
        # Apply conditional formatting for status column
        for i, row in enumerate(data[1:], 1):  # Skip header
            if row[4].lower() == 'completed':
                table.setStyle(TableStyle([('TEXTCOLOR', (4,i), (4,i), BrandColors.SUCCESS)]))
            elif row[4].lower() in ['scheduled', 'pending']:
                table.setStyle(TableStyle([('TEXTCOLOR', (4,i), (4,i), BrandColors.WARNING)]))
            elif row[4].lower() in ['missed', 'overdue']:
                table.setStyle(TableStyle([('TEXTCOLOR', (4,i), (4,i), BrandColors.ACCENT)]))

        story.append(table)
    else:
        story.append(Paragraph(
            "💉 No vaccination history available for this patient.", 
            styles['Detail']
        ))

    story.append(Spacer(1, 0.2*inch))