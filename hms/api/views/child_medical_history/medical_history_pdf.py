# api/views/child_medical_history/medical_history_pdf.py
import io
from django.http import FileResponse
from rest_framework.views import APIView
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Flowable, Image
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

from ...permissions import IsMedicalProfessionalUser, IsAdminUser
from ...models import Child
from .pdf import *
from .diagnosis_history import diagnosis_history
from .treatment_history import treatment_history
from .prescription_history import prescription_history
from .vaccination_history import vaccination_history
from .lab_history import lab_history
from .appointment_history import appointment_history


class ChildMedicalHistoryPDFView(APIView):
    """
    A View that generates and returns a professionally styled PDF medical history report.
    Only medical professionals and admins can access this.
    """
    permission_classes = [IsMedicalProfessionalUser | IsAdminUser]

    def _get_custom_styles(self):
        """Create custom paragraph styles for the medical report."""
        styles = getSampleStyleSheet()
        
        # Try to use custom fonts, fallback to Helvetica
        try:
            pdfmetrics.registerFont(TTFont('Roboto', 'path/to/Roboto-Regular.ttf'))
            pdfmetrics.registerFont(TTFont('Roboto-Bold', 'path/to/Roboto-Bold.ttf'))
            base_font = 'Roboto'
        except:
            base_font = 'Helvetica'

        # Custom styles
        styles.add(ParagraphStyle(
            name='Header',
            fontName=f'{base_font}-Bold' if base_font == 'Roboto' else 'Helvetica-Bold',
            fontSize=20,
            leading=24,
            alignment=TA_CENTER,
            textColor=BrandColors.PRIMARY,
            spaceAfter=10,
        ))
        
        styles.add(ParagraphStyle(
            name='SubHeader',
            fontName=f'{base_font}-Bold' if base_font == 'Roboto' else 'Helvetica-Bold',
            fontSize=16,
            leading=20,
            alignment=TA_CENTER,
            textColor=BrandColors.SECONDARY,
            spaceAfter=15,
        ))
        
        styles.add(ParagraphStyle(
            name='SectionHeader',
            fontName=f'{base_font}-Bold' if base_font == 'Roboto' else 'Helvetica-Bold',
            fontSize=14,
            leading=17,
            spaceAfter=8,
            textColor=BrandColors.PRIMARY,
            borderWidth=0,
            borderColor=BrandColors.PRIMARY,
        ))
        
        styles.add(ParagraphStyle(
            name='SubSectionHeader',
            fontName=f'{base_font}-Bold' if base_font == 'Roboto' else 'Helvetica-Bold',
            fontSize=12,
            leading=15,
            spaceAfter=6,
            textColor=BrandColors.ACCENT
        ))
        
        styles.add(ParagraphStyle(
            name='Detail',
            fontName=base_font,
            fontSize=10,
            leading=14,
            spaceAfter=3,
            textColor=BrandColors.TEXT
        ))

        styles.add(ParagraphStyle(
            name='Warning',
            fontName=f'{base_font}-Bold' if base_font == 'Roboto' else 'Helvetica-Bold',
            fontSize=10,
            leading=14,
            spaceAfter=3,
            textColor=BrandColors.WARNING,
            backColor=colors.Color(1.0, 0.95, 0.8),  # Light yellow background
            leftIndent=10,
            rightIndent=10,
            spaceBefore=5,
           
        ))

        return styles

    def _add_header_section(self, elements, styles, doc_width, child):
        """Add the header section with logo and title."""
        # Add logo if available (you'll need to implement get_logo_path or remove this)
        # logo_path = get_logo_path()
        # if logo_path and Path(logo_path).exists():
        #     img = Image(logo_path)
        #     img.drawHeight = 0.6 * inch
        #     img.drawWidth = img.drawHeight * img.imageWidth / img.imageHeight
        #     elements.append(img)

        elements.append(Paragraph("Children's Hospital", styles['Header']))
        elements.append(Paragraph("COMPREHENSIVE MEDICAL HISTORY REPORT", styles['SubHeader']))
        elements.append(StyledLine(doc_width, thickness=3, color=BrandColors.PRIMARY))
        elements.append(Spacer(1, 0.3 * inch))

        # Patient identification banner
        patient_banner = f"<b>PATIENT:</b> {child.first_name.upper()} {child.last_name.upper()}"
        elements.append(Paragraph(patient_banner, styles['SubSectionHeader']))
        elements.append(StyledLine(doc_width, thickness=1, color=BrandColors.SECONDARY))
        elements.append(Spacer(1, 0.2 * inch))

    
    def _add_basic_info_section(self, elements, styles, child):
        """Add enhanced basic information section with growth and clinical details."""
        elements.append(Paragraph("PATIENT INFORMATION", styles['SectionHeader']))
        
        # Calculate age from date of birth
        age = datetime.now().date() - child.date_of_birth
        age_years = age.days // 365
        age_months = (age.days % 365) // 30
        
        # Safely handle guardian
        guardian = getattr(child, "primary_guardian", None)
        if guardian:
            guardian_display = f"{guardian.first_name} {guardian.last_name}"
        else:
            guardian_display = "Not specified"

        # Format growth info with units
        def fmt(value, unit):
            return f"{value} {unit}" if value is not None else "Not recorded"

        basic_info_data = [
            ["Full Name:", f"{child.first_name} {child.last_name}", "Patient ID:", str(child.id)],
            ["Date of Birth:", child.date_of_birth.strftime("%B %d, %Y"), 
            "Age:", f"{age_years} years, {age_months} months"],
            ["Gender:", child.get_gender_display(), "Blood Group:", child.blood_group or "Not specified"],
            ["Birth Weight:", fmt(child.birth_weight, "kg"), "Birth Height:", fmt(child.birth_height, "cm")],
            ["Current Weight:", fmt(child.current_weight, "kg"), "Current Height:", fmt(child.current_height, "cm")],
            ["Current BMI:", fmt(child.current_bmi, "kg/m²"), "Interpretation:", child.current_bmi_interpretation or "N/A"],
            ["Primary Guardian:", guardian_display, "", ""]
        ]
        
        basic_info_table = Table(
            basic_info_data, 
            colWidths=[1.5*inch, 2.5*inch, 1.5*inch, 2.0*inch]
        )
        basic_info_table.setStyle(TableStyle([
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,0), (-1,-1), 10),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),  # Bold first column
            ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),  # Bold third column
            ('BACKGROUND', (0,0), (-1,-1), BrandColors.LIGHT_BG),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOX', (0,0), (-1,-1), 1, BrandColors.PRIMARY),
            ('INNERGRID', (0,0), (-1,-1), 0.5, BrandColors.SECONDARY),
        ]))
        
        elements.append(basic_info_table)
        elements.append(Spacer(1, 0.25*inch))

    def _add_medical_alerts_section(self, elements, styles, child):
        """Add medical alerts section for critical information."""
        alerts = []
        
        if child.allergies:
            alerts.append(f"<b>ALLERGIES:</b> {child.allergies}")
        if child.chronic_conditions:
            alerts.append(f"<b>CHRONIC CONDITIONS:</b> {child.chronic_conditions}")
        if child.current_medications:
            alerts.append(f"<b>CURRENT MEDICATIONS:</b> {child.current_medications}")
        
        if alerts:
            elements.append(Paragraph("⚠️ MEDICAL ALERTS", styles['SectionHeader']))
            
            for alert in alerts:
                elements.append(Paragraph(alert, styles['Warning']))
            
            elements.append(Spacer(1, 0.25*inch))

    def _add_section_divider(self, elements, styles, doc_width, title):
        """Add a styled section divider."""
        elements.append(Spacer(1, 0.2*inch))
        elements.append(StyledLine(doc_width, thickness=2, color=BrandColors.SECONDARY))
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph(title, styles['SectionHeader']))
        elements.append(StyledLine(doc_width * 0.3, thickness=1, color=BrandColors.ACCENT))
        elements.append(Spacer(1, 0.15*inch))

    def _add_footer_content(self, elements, styles, doc_width):
        """Add footer content before the actual footer."""
        elements.append(Spacer(1, 0.3*inch))
        elements.append(StyledLine(doc_width, thickness=1, color=BrandColors.SECONDARY))
        elements.append(Spacer(1, 0.1*inch))
        
        footer_info = [
            "This report contains confidential medical information and should be handled according to HIPAA guidelines.",
            "For questions about this report, please contact our medical records department at (555) 123-4567.",
            "Report generated by Children's Hospital Medical Information System."
        ]
        
        for info in footer_info:
            elements.append(Paragraph(info, styles['Detail']))

    def get(self, request, child_id):
        """Generate a professionally styled PDF medical history report."""
        try:
            child = Child.objects.get(pk=child_id)
        except Child.DoesNotExist:
            return FileResponse(
                io.BytesIO(b"Child not found"), 
                status=404,
                content_type='text/plain'
            )

        # Generate PDF with professional styling
        buffer = io.BytesIO()
        
        # Use letter size with proper margins
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=0.75 * inch,
            rightMargin=0.75 * inch,
            topMargin=1.0 * inch,
            bottomMargin=1.0 * inch,
            title=f"Medical History - {child.first_name} {child.last_name}"
        )

        elements = []
        styles = self._get_custom_styles()
        doc_width = doc.width

        # Build PDF sections
        self._add_header_section(elements, styles, doc_width, child)
        self._add_basic_info_section(elements, styles, child)
        self._add_medical_alerts_section(elements, styles, child)
        
        self._add_section_divider(elements, styles, doc_width, "📋 DIAGNOSIS HISTORY")
        diagnosis_history(child, styles, elements)

        self._add_section_divider(elements, styles, doc_width, "📋 TREATMENT HISTORY")
        treatment_history(child, styles, elements)

        # Add modular sections with styled dividers
        self._add_section_divider(elements, styles, doc_width, "📋 PRESCRIPTION HISTORY")
        prescription_history(child, styles, elements)
        
        self._add_section_divider(elements, styles, doc_width, "🔬 APPOINTMENT HISTORY")
        appointment_history(child, styles, elements)
        
        self._add_section_divider(elements, styles, doc_width, "💉 VACCINATION HISTORY")
        vaccination_history(child, styles, elements)
        
        self._add_section_divider(elements, styles, doc_width, "🔬 LABORATORY RESULTS")
        lab_history(child, styles, elements)
        
        
        
        # Footer content
        self._add_footer_content(elements, styles, doc_width)

        # Footer function
        def add_medical_footer(canvas, doc):
            footer = Footer(doc, f"{child.first_name} {child.last_name}")
            footer.canv = canvas
            footer.draw()

        # Build the PDF
        doc.build(elements, onFirstPage=add_medical_footer, onLaterPages=add_medical_footer)

        buffer.seek(0)
        return FileResponse(
            buffer, 
            as_attachment=True,
            filename=f"medical_history_{child.first_name}_{child.last_name}_{child.id}.pdf",
            content_type='application/pdf'
        )