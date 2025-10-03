from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from .pdf import *


import datetime

def format_ordinal(n: int) -> str:
    """Return ordinal string (e.g., 1 -> 1st, 2 -> 2nd, 3 -> 3rd, etc.)."""
    if 11 <= n % 100 <= 13:
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
    return f"{n}{suffix}"


def appointment_history(child, styles, story):
    """Append the appointment history section for the given child to the PDF story."""
    appointments = child.appointments.all().order_by("-appointment_date", "-appointment_time")

    story.append(Spacer(1, 0.1 * inch))

    if appointments.exists():
        total_appointments = appointments.count()
        completed = appointments.filter(status="COMPLETED").count()
        pending = appointments.filter(status="PENDING").count()
        cancelled = appointments.filter(status="CANCELLED").count()

        story.append(Paragraph(
            f"<b>Summary:</b> {completed} completed | {pending} pending | {cancelled} cancelled | "
            f"Total: {total_appointments}",
            styles['Detail']
        ))
        story.append(Spacer(1, 0.1 * inch))

        # Table header
        data = [["Date", "Time", "Doctor", "Reason", "Status"]]

        for appt in appointments:
            doctor_name = (
                f"Dr. {appt.doctor.first_name} {appt.doctor.last_name}"
                if appt.doctor and appt.doctor.user else "N/A"
            )

            # Format date and time nicely
            if appt.appointment_date:
                day = appt.appointment_date.day
                formatted_date = f"{format_ordinal(day)} {appt.appointment_date.strftime('%B, %Y')}"
            else:
                formatted_date = "—"

            formatted_time = (
                appt.appointment_time.strftime("%I:%M %p").lower()
                if appt.appointment_time else "—"
            )

            data.append([
                formatted_date,
                formatted_time,
                doctor_name,
                (appt.reason[:40] + "...") if len(appt.reason) > 40 else appt.reason,
                appt.status.title()
            ])

        # Create styled table
        table = Table(data, colWidths=[1.5*inch, 1.0*inch, 1.8*inch, 2.5*inch, 1.0*inch])
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

        # Conditional formatting for status column
        for i, row in enumerate(data[1:], 1):  # Skip header
            if row[4].lower() == "completed":
                table.setStyle(TableStyle([('TEXTCOLOR', (4, i), (4, i), BrandColors.SUCCESS)]))
            elif row[4].lower() in ["pending", "confirmed"]:
                table.setStyle(TableStyle([('TEXTCOLOR', (4, i), (4, i), BrandColors.WARNING)]))
            elif row[4].lower() == "cancelled":
                table.setStyle(TableStyle([('TEXTCOLOR', (4, i), (4, i), BrandColors.ACCENT)]))

        story.append(table)
    else:
        story.append(Paragraph(
            "📅 No appointment history available for this patient.",
            styles['Detail']
        ))

    story.append(Spacer(1, 0.2 * inch))
