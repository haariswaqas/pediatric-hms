import io
from django.http import FileResponse
from rest_framework import viewsets, status
from rest_framework.response import Response
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

# Import your models and permissions
from ..models import Bill
from ..permissions import BillPermission, IsAdminUser

# Brand Colors (add this to your utils or define here)
class BrandColors:
    PRIMARY = colors.Color(0.2, 0.4, 0.7)  # Blue
    SECONDARY = colors.Color(0.3, 0.6, 0.8)  # Light Blue
    TEXT = colors.Color(0.2, 0.2, 0.2)  # Dark Gray
    LIGHT_BG = colors.Color(0.95, 0.97, 0.99)  # Very Light Blue
    SUCCESS = colors.Color(0.2, 0.7, 0.3)  # Green
    WARNING = colors.Color(0.9, 0.7, 0.1)  # Orange

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

class BillGenerationViewSet(viewsets.ViewSet):
    """
    A ViewSet that generates and returns a professionally styled PDF bill using the bill_number.
    Parents only see their own child's bills.
    """
    permission_classes = [BillPermission | IsAdminUser]

    def _get_custom_styles(self):
        """Create custom paragraph styles for the bill."""
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

        return styles

    def _add_header_section(self, elements, styles, doc_width):
        """Add the header section with logo and title."""
        # Add logo if available (you'll need to implement get_logo_path or remove this)
        # logo_path = get_logo_path()
        # if logo_path and Path(logo_path).exists():
        #     img = Image(logo_path)
        #     img.drawHeight = 0.5 * inch
        #     img.drawWidth = img.drawHeight * img.imageWidth / img.imageHeight
        #     elements.append(img)

        elements.append(Paragraph("Children's Hospital", styles['Header']))
        elements.append(Paragraph("PATIENT BILL", styles['SubHeader']))
        elements.append(StyledLine(doc_width, thickness=2, color=BrandColors.PRIMARY))
        elements.append(Spacer(1, 0.2 * inch))

    def _add_bill_info_section(self, elements, styles, bill):
        """Add bill information section."""
        elements.append(Paragraph("BILL INFORMATION", styles['SectionHeader']))
        
        bill_info_data = [
            ["Bill Number:", bill.bill_number, "Bill Date:", bill.created_at.strftime('%Y-%m-%d')],
            ["Status:", bill.status if hasattr(bill, 'status') else "Active", 
             "Patient:", f"{bill.child.first_name} {bill.child.last_name}"],
            ["Due Date:", str(bill.due_date), "", ""]
        ]
        
        bill_info_table = Table(bill_info_data, colWidths=[1.5*inch, 2.5*inch, 1.5*inch, 2.0*inch])
        bill_info_table.setStyle(TableStyle([
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,0), (-1,-1), 10),
            ('BACKGROUND', (0,0), (-1,-1), BrandColors.LIGHT_BG),
            ('LEFTPADDING', (0,0), (-1,-1), 5),
            ('RIGHTPADDING', (0,0), (-1,-1), 5),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(bill_info_table)
        elements.append(Spacer(1, 0.25*inch))

    def _add_bill_items_section(self, elements, styles, bill):
        """Add bill items table (includes lab tests)."""
        elements.append(Paragraph("BILL ITEMS", styles['SectionHeader']))
        
        # Header row
        table_data = [["Description", "Quantity", "Unit Price", "Amount"]]
        
        for item in bill.items.all():
            # If it’s a lab test, mark it
            description = item.description
            if "Test" in description:
                description = f"{description}"  # Add an icon or marker
            
            table_data.append([
                description,
                str(item.quantity),
                f"${item.unit_price:.2f}",
                f"${item.amount:.2f}"
            ])
        
        table = Table(
            table_data, 
            colWidths=[3.0*inch, 1.0*inch, 1.5*inch, 1.5*inch]
        )
        table.setStyle(TableStyle([
            # Header styling
            ('BACKGROUND', (0,0), (-1,0), BrandColors.PRIMARY),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 11),
            # Data styling
            ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,1), (-1,-1), 10),
            ('ALIGN', (1,1), (-1,-1), 'CENTER'),
            ('ALIGN', (2,1), (3,-1), 'RIGHT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            # Grid
            ('GRID', (0,0), (-1,-1), 0.5, BrandColors.PRIMARY),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            # Alternating rows
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BrandColors.LIGHT_BG]),
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 0.25*inch))


    def _add_financial_summary(self, elements, styles, bill):
        """Add financial summary section."""
        elements.append(Paragraph("FINANCIAL SUMMARY", styles['SectionHeader']))
        
        summary_data = [
            ["Subtotal:", f"${bill.subtotal:.2f}"],
            ["Tax:", f"${bill.tax_amount:.2f}"],
            ["Discount:", f"-${bill.discount_amount:.2f}"],
            ["Total:", f"${bill.total_amount:.2f}"],
            ["Amount Paid:", f"${bill.amount_paid:.2f}"],
        ]
        
        # Style the balance due differently based on amount
        balance_color = BrandColors.SUCCESS if bill.balance_due == 0 else BrandColors.TEXT
        summary_data.append(["Balance Due:", f"${bill.balance_due:.2f}"])
        
        summary_table = Table(summary_data, colWidths=[2.5*inch, 2.0*inch])
        summary_table.setStyle(TableStyle([
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,0), (-1,-1), 10),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('BACKGROUND', (0,0), (-1,-1), BrandColors.LIGHT_BG),
            ('BOX', (0,0), (-1,-1), 1, BrandColors.PRIMARY),
            ('ALIGN', (1,0), (1,-1), 'RIGHT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            # Highlight total and balance due
            ('FONTNAME', (0,3), (-1,3), 'Helvetica-Bold'),
            ('FONTSIZE', (0,3), (-1,3), 11),
            ('FONTNAME', (0,5), (-1,5), 'Helvetica-Bold'),
            ('FONTSIZE', (0,5), (-1,5), 11),
            ('TEXTCOLOR', (0,5), (-1,5), balance_color),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 0.2*inch))

    def _add_footer_content(self, elements, styles, doc_width):
        """Add footer content before the actual footer."""
        elements.append(StyledLine(doc_width, thickness=1, color=BrandColors.SECONDARY))
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph("Thank you for your prompt payment.", styles['Detail']))
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph(
            "For questions about this bill, please contact our billing department at (555) 123-4567.", 
            styles['Detail']
        ))

    def retrieve(self, request, pk=None):
        """
        Retrieve a professionally styled bill PDF by bill_number.
        """
        try:
            bill = Bill.objects.get(bill_number=pk)
        except Bill.DoesNotExist:
            return Response({"detail": "Bill not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        # Check access
        if user.role == 'parent' and hasattr(user, 'parentprofile'):
            if bill.child.primary_guardian != user.parentprofile:
                return Response({"detail": "Not authorized to view this bill."},
                                status=status.HTTP_403_FORBIDDEN)

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
            title=f"Bill #{bill.bill_number}"
        )

        elements = []
        styles = self._get_custom_styles()
        doc_width = doc.width

        # Build PDF sections
        self._add_header_section(elements, styles, doc_width)
        self._add_bill_info_section(elements, styles, bill)
        self._add_bill_items_section(elements, styles, bill)
        self._add_financial_summary(elements, styles, bill)
        self._add_footer_content(elements, styles, doc_width)

        # Footer function
        def add_bill_footer(canvas, doc):
            footer = Footer(doc, f"Bill #{bill.bill_number}")
            footer.canv = canvas
            footer.draw()

        # Build the PDF
        doc.build(elements, onFirstPage=add_bill_footer, onLaterPages=add_bill_footer)

        buffer.seek(0)
        return FileResponse(
            buffer, 
            as_attachment=True,
            filename=f"bill_{bill.bill_number}.pdf",
            content_type='application/pdf'
        )