# api/reports/lab_report_pdf.py
from reportlab.platypus import SimpleDocTemplate, Table, Paragraph, Spacer, PageBreak
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import TableStyle, Flowable, Image
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
from typing import List, Any, Dict
from pathlib import Path
from collections import defaultdict
from datetime import datetime
import logging

from .utils import BrandColors, get_logo_path

logger = logging.getLogger(__name__)

class StyledLine(Flowable):
    def __init__(self, width, thickness=1, color=colors.black, dash=None):
        super().__init__()
        self.width = width
        self.thickness = thickness
        self.color = color
        self.dash = dash
        
    def draw(self):
        self.canv.saveState()
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        if self.dash:
            self.canv.setDash(self.dash[0], self.dash[1])
        self.canv.line(0, 0, self.width, 0)
        self.canv.restoreState()
        
class Footer(Flowable):
    def __init__(self, doc, report_title):
        Flowable.__init__(self)
        self.doc = doc
        self.report_title = report_title
        self.width = doc.width
        self.height = 0.75*inch
        
    def draw(self):
        self.canv.saveState()
        
        # Draw footer background
        self.canv.setFillColor(BrandColors.LIGHT_BG)
        self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        
        # Draw line above footer
        self.canv.setStrokeColor(BrandColors.PRIMARY)
        self.canv.setLineWidth(2)
        self.canv.line(0, self.height, self.width, self.height)
        
        # Add page number
        self.canv.setFillColor(BrandColors.TEXT)
        self.canv.setFont('Helvetica', 8)
        page_num = self.canv.getPageNumber()
        
        # Add confidentiality notice
        self.canv.drawCentredString(self.width/2, self.height/3,
            f"CONFIDENTIAL - Page {page_num} - {self.report_title}")
        
        # Add generation timestamp
        self.canv.setFont('Helvetica', 7)
        self.canv.drawString(10, 10, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        
        # Add hospital copyright
        self.canv.drawRightString(self.width-10, 10, "© Children's Hospital")
        
        self.canv.restoreState()


def generate_lab_report_pdf(report_data: List[Dict[str, Any]], filepath: Path) -> None:
    """Generate a medical lab report PDF with highly organized, clean layout and enhanced medical-style formatting."""

    if not report_data:
        raise ValueError("No lab data available for PDF generation.")

    # Group data
    grouped_data = {}
    for record in report_data:
        request_id = record.get('Request ID')
        test_name = record.get('Test')
        group_key = f"{request_id}_{test_name}"
        if group_key not in grouped_data:
            grouped_data[group_key] = {
                'patient_info': {
                    'name': record.get('Patient'),
                    'request_id': request_id,
                    'date_performed': record.get('Date Performed'),
                    'requested_by': record.get('Requested By'),
                    'performed_by': record.get('Performed By'),
                    'test_name': test_name,
                },
                'parameters': []
            }
        grouped_data[group_key]['parameters'].append({
            'parameter': record.get('Parameter Name'),
            'value': record.get('Value'),
            'unit': record.get('Unit'),
            'reference_range': record.get('Reference Range'),
            'status': record.get('Status'),
        })

    pagesize = letter
    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=pagesize,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=1.0 * inch,
        bottomMargin=1.0 * inch,
        title="Laboratory Report"
    )

    # Load fonts
    try:
        pdfmetrics.registerFont(TTFont('Roboto', 'path/to/Roboto-Regular.ttf'))
        pdfmetrics.registerFont(TTFont('Roboto-Bold', 'path/to/Roboto-Bold.ttf'))
        base_font = 'Roboto'
    except:
        base_font = 'Helvetica'

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='Header',
        fontName=f'{base_font}-Bold' if base_font == 'Roboto' else 'Helvetica-Bold',
        fontSize=18,
        leading=22,
        alignment=TA_CENTER,
        textColor=BrandColors.PRIMARY,
        spaceAfter=10,
    ))
    styles.add(ParagraphStyle(
        name='SubHeader',
        fontName=f'{base_font}-Bold' if base_font == 'Roboto' else 'Helvetica-Bold',
        fontSize=14,
        leading=18,
        alignment=TA_CENTER,
        textColor=BrandColors.SECONDARY,
        spaceAfter=15,
    ))
    styles.add(ParagraphStyle(
        name='SectionHeader',
        fontName=f'{base_font}-Bold' if base_font == 'Roboto' else 'Helvetica-Bold',
        fontSize=12,
        leading=15,
        spaceAfter=8,
        textColor=BrandColors.PRIMARY
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
        name='TableHeader',
        fontName=f'{base_font}-Bold' if base_font == 'Roboto' else 'Helvetica-Bold',
        fontSize=10,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.white
    ))
    styles.add(ParagraphStyle(
        name='TestValue',
        fontName=base_font,
        fontSize=10,
        leading=12,
        alignment=TA_CENTER,
        textColor=BrandColors.TEXT
    ))
    styles.add(ParagraphStyle(
        name='AbnormalValue',
        fontName=f'{base_font}-Bold' if base_font == 'Roboto' else 'Helvetica-Bold',
        fontSize=10,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.red
    ))

    elements = []
    request_groups = {}
    for group_key, data in grouped_data.items():
        request_id = data['patient_info']['request_id']
        request_groups.setdefault(request_id, []).append((group_key, data))

    for req_index, (request_id, test_groups) in enumerate(request_groups.items()):
        if req_index > 0:
            elements.append(PageBreak())

        # Header
        logo_path = get_logo_path()
        if logo_path:
            img = Image(logo_path)
            img.drawHeight = 0.5 * inch
            img.drawWidth = img.drawHeight * img.imageWidth / img.imageHeight
            elements.append(img)

        elements.append(Paragraph("Children's Hospital", styles['Header']))
        elements.append(Paragraph("LABORATORY REPORT", styles['SubHeader']))
        elements.append(StyledLine(doc.width, thickness=2, color=BrandColors.PRIMARY))
        elements.append(Spacer(1, 0.2 * inch))

        # Patient Info
        patient_info = test_groups[0][1]['patient_info']
        elements.append(Paragraph("PATIENT INFORMATION", styles['SectionHeader']))

        patient_data = [
            ["Patient Name:", patient_info['name'], "Request ID:", patient_info['request_id']],
            ["Date Performed:", patient_info['date_performed'], "Requested By:", patient_info['requested_by']],
            ["Performed By:", patient_info['performed_by'], '', '']
        ]
        patient_table = Table(patient_data, colWidths=[1.5 * inch, 2.5 * inch, 1.5 * inch, 2.0 * inch])
        patient_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('BACKGROUND', (0, 0), (-1, -1), BrandColors.LIGHT_BG),
        ]))
        elements.append(patient_table)
        elements.append(Spacer(1, 0.25 * inch))

        # Test Results
        for test_index, (group_key, data) in enumerate(test_groups):
            test_name = data['patient_info']['test_name']
            elements.append(Paragraph(f"TEST: {test_name.upper()}", styles['SectionHeader']))
            elements.append(Spacer(1, 0.1 * inch))

            result_headers = [
                Paragraph('Parameter', styles['TableHeader']),
                Paragraph('Result', styles['TableHeader']),
                Paragraph('Unit', styles['TableHeader']),
                Paragraph('Reference Range', styles['TableHeader']),
                Paragraph('Status', styles['TableHeader'])
            ]
            result_data = [result_headers]

            for param in data['parameters']:
                status = param.get('status', '').upper()
                is_abnormal = status in ['HIGH', 'LOW', 'ABNORMAL', 'CRITICAL']
                value_style = styles['AbnormalValue'] if is_abnormal else styles['TestValue']
                status_style = styles['AbnormalValue'] if is_abnormal else styles['TestValue']

                result_data.append([
                    Paragraph(param.get('parameter', ''), styles['TestValue']),
                    Paragraph(str(param.get('value', '')), value_style),
                    Paragraph(param.get('unit', ''), styles['TestValue']),
                    Paragraph(param.get('reference_range', ''), styles['TestValue']),
                    Paragraph(status, status_style),
                ])

            results_table = Table(result_data, colWidths=[2.2 * inch, 1.2 * inch, 0.8 * inch, 1.5 * inch, 1.0 * inch])
            results_table_style = [
                ('BACKGROUND', (0, 0), (-1, 0), BrandColors.TABLE_HEADER),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('GRID', (0, 0), (-1, -1), 1, BrandColors.PRIMARY),
                ('BOX', (0, 0), (-1, -1), 2, BrandColors.PRIMARY),
            ]
            for i in range(1, len(result_data)):
                results_table_style.append(('BACKGROUND', (0, i), (-1, i),
                                            BrandColors.TABLE_EVEN if i % 2 == 0 else colors.white))

            results_table.setStyle(TableStyle(results_table_style))
            elements.append(results_table)

            if test_index < len(test_groups) - 1:
                elements.append(Spacer(1, 0.25 * inch))

        # Final Notes
        elements.append(Spacer(1, 0.25 * inch))
        elements.append(StyledLine(doc.width, thickness=1, color=BrandColors.SECONDARY))
        elements.append(Spacer(1, 0.1 * inch))
        elements.append(Paragraph("CLINICAL NOTES", styles['SectionHeader']))
        clinical_notes = (
            "Values outside the reference range are marked and should be reviewed by the attending physician. "
            "This report should be interpreted in conjunction with clinical findings and other laboratory data."
        )
        elements.append(Paragraph(clinical_notes, styles['Detail']))
        elements.append(Spacer(1, 0.15 * inch))
        elements.append(Paragraph("This laboratory is certified and maintains accreditation standards for clinical testing.",
                                   styles['Detail']))

    def add_lab_report_footer(canvas, doc):
        footer = Footer(doc, "Laboratory Report")
        footer.canv = canvas
        footer.draw()

    doc.build(elements, onFirstPage=add_lab_report_footer, onLaterPages=add_lab_report_footer)
    logger.info(f"Medical lab report PDF generated at {filepath}")

