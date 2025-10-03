# api/reports/bill_pdf.py
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Flowable, Image, PageBreak
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
import logging

from .utils import BrandColors, get_logo_path

logger = logging.getLogger(__name__)

class StyledLine(Flowable):
    """Draw a horizontal line."""
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
    """Footer for the PDF."""
    def __init__(self, doc, report_title):
        Flowable.__init__(self)
        self.doc = doc
        self.report_title = report_title
        self.width = doc.width
        self.height = 0.75*inch

    def draw(self):
        self.canv.saveState()
        self.canv.setFillColor(BrandColors.LIGHT_BG)
        self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        self.canv.setStrokeColor(BrandColors.PRIMARY)
        self.canv.setLineWidth(2)
        self.canv.line(0, self.height, self.width, self.height)
        self.canv.setFillColor(BrandColors.TEXT)
        self.canv.setFont('Helvetica', 8)
        page_num = self.canv.getPageNumber()
        self.canv.drawCentredString(self.width/2, self.height/3,
            f"CONFIDENTIAL - Page {page_num} - {self.report_title}")
        self.canv.setFont('Helvetica', 7)
        self.canv.drawString(10, 10, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        self.canv.drawRightString(self.width-10, 10, "© Children's Hospital")
        self.canv.restoreState()


def generate_bill_pdf(bill_data: Dict[str, Any], filepath: Path) -> None:
    """Generate a clean, professional PDF bill."""
    if not bill_data:
        raise ValueError("No bill data available for PDF generation.")

    pagesize = letter
    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=pagesize,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=1.0 * inch,
        bottomMargin=1.0 * inch,
        title="Patient Bill"
    )

    # Fonts
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

    elements = []

    # Header with Logo
    logo_path = get_logo_path()
    if logo_path:
        img = Image(logo_path)
        img.drawHeight = 0.5 * inch
        img.drawWidth = img.drawHeight * img.imageWidth / img.imageHeight
        elements.append(img)

    elements.append(Paragraph("Children's Hospital", styles['Header']))
    elements.append(Paragraph("PATIENT BILL", styles['SubHeader']))
    elements.append(StyledLine(doc.width, thickness=2, color=BrandColors.PRIMARY))
    elements.append(Spacer(1, 0.2 * inch))

    # Bill Info
    elements.append(Paragraph("BILL INFORMATION", styles['SectionHeader']))
    bill_info_table = Table([
        ["Bill Number:", bill_data.get("bill_number"), "Bill Date:", bill_data.get("bill_date")],
        ["Status:", bill_data.get("status"), "Patient:", bill_data.get("child")],
        ["Due Date:", bill_data.get("due_date"), "", ""]
    ], colWidths=[1.5*inch, 2.5*inch, 1.5*inch, 2.0*inch])
    bill_info_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('BACKGROUND', (0,0), (-1,-1), BrandColors.LIGHT_BG),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    elements.append(bill_info_table)
    elements.append(Spacer(1, 0.25*inch))

    # Bill Items
    elements.append(Paragraph("BILL ITEMS", styles['SectionHeader']))
    table_data = [["Description", "Quantity", "Unit Price", "Amount"]]
    for item in bill_data.get("items", []):
        table_data.append([
            item.get("description"),
            str(item.get("quantity")),
            f"${item.get('unit_price'):.2f}",
            f"${item.get('amount'):.2f}"
        ])
    table = Table(table_data, colWidths=[3.0*inch, 1.0*inch, 1.5*inch, 1.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BrandColors.PRIMARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('ALIGN', (1,1), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, BrandColors.PRIMARY)
    ]))
    elements.append(table)
    elements.append(Spacer(1, 0.25*inch))

    # Financial Summary
    elements.append(Paragraph("FINANCIAL SUMMARY", styles['SectionHeader']))
    summary_table = Table([
        ["Subtotal:", f"${bill_data.get('subtotal'):.2f}"],
        ["Tax:", f"${bill_data.get('tax'):.2f}"],
        ["Discount:", f"${bill_data.get('discount'):.2f}"],
        ["Total:", f"${bill_data.get('total'):.2f}"],
        ["Amount Paid:", f"${bill_data.get('amount_paid'):.2f}"],
        ["Balance Due:", f"${bill_data.get('balance_due'):.2f}"]
    ], colWidths=[2.5*inch, 2.0*inch])
    summary_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('BACKGROUND', (0,0), (-1,-1), BrandColors.LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 0.5, BrandColors.PRIMARY),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.2*inch))

    # Notes
    if bill_data.get("notes"):
        elements.append(Paragraph("NOTES", styles['SectionHeader']))
        elements.append(Paragraph(bill_data.get("notes"), styles['Detail']))
        elements.append(Spacer(1, 0.2*inch))

    elements.append(StyledLine(doc.width, thickness=1, color=BrandColors.SECONDARY))
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph("Thank you for your prompt payment.", styles['Detail']))

    # Footer
    def add_bill_footer(canvas, doc):
        footer = Footer(doc, "Patient Bill")
        footer.canv = canvas
        footer.draw()

    doc.build(elements, onFirstPage=add_bill_footer, onLaterPages=add_bill_footer)
    logger.info(f"Bill PDF generated at {filepath}")
