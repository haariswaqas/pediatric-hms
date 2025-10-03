# api/reports/pdf.py

# UTILS ==> PDF ==> DATA ==> SERVICES
from reportlab.platypus import SimpleDocTemplate, Table, Paragraph, Spacer, PageBreak
from reportlab.lib.pagesizes import landscape, letter, A4
from pathlib import Path
from .utils import BrandColors, generate_filename, ReportTypeEnum 
from datetime import datetime
import logging
from .lab_report_pdf import generate_lab_report_pdf
from typing import List, Dict, Any
from reportlab.platypus import Flowable, Image, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet

from reportlab.pdfbase import pdfmetrics
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.pdfbase.ttfonts import TTFont
from .utils import get_logo_path

logger = logging.getLogger(__name__)

class StyledLine(Flowable):
    def __init__(self, width, thickness=1, color=colors.black, dash=None):
        Flowable.__init__(self)
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

# Custom footer class
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

def determine_optimal_page_size(num_columns):
    """Dynamically determine the best page size based on number of columns"""
    if num_columns <= 5:
        return letter  # Standard letter for fewer columns
    elif num_columns <= 8:
        return landscape(letter)  # Landscape letter for medium number of columns
    elif num_columns <= 12:
        return landscape(A4)  # Landscape A4 for more columns
    else:
        # For very large numbers of columns, go with a custom large size
        from reportlab.lib.pagesizes import legal
        return landscape(legal)

    
  
def generate_pdf(report_data: List[Dict[str, Any]], filepath: Path) -> None:
    """
    Main PDF generation function that routes to appropriate generator based on data type.
    """
    if not report_data:
        raise ValueError("No data available for PDF generation")

    # Determine if this is a lab report based on data structure
    columns = list(report_data[0].keys())
    
    # Check if this is lab report data
    if "Parameter Name" in columns and "Reference Range" in columns and "Request ID" in columns:
        # Route to specialized lab report generator
        generate_lab_report_pdf(report_data, filepath)
        return
    
    # Original table-based report generation for other report types
    generate_table_based_pdf(report_data, filepath)

def generate_table_based_pdf(report_data: List[Dict[str, Any]], filepath: Path) -> None:
    """
    Original table-based PDF generation for admission, discharge, vaccination, etc. reports.
    """
    # Determine columns and report type
    columns = list(report_data[0].keys())

    if "Admitted On" in columns:
        report_title = "Admission Report"
    elif "Vaccine" in columns or "Dose #" in columns:
        report_title = "Vaccination Records Report"
    elif "Drug" in columns:
        report_title = "Prescription Reports"
    elif "Date Dispensed" in columns:
        report_title = "Drug Dispense Records"
    else:
        report_title = "Discharge Report"

    # Register and load custom fonts if available
    try:
        pdfmetrics.registerFont(TTFont('Roboto', 'path/to/Roboto-Regular.ttf'))
        pdfmetrics.registerFont(TTFont('Roboto-Bold', 'path/to/Roboto-Bold.ttf'))
        pdfmetrics.registerFont(TTFont('Roboto-Italic', 'path/to/Roboto-Italic.ttf'))
        base_font = 'Roboto'
    except:
        # Fall back to Helvetica which is always available
        base_font = 'Helvetica'
        logger.info("Using default fonts as custom fonts are not available")

    # Determine optimal page size based on number of columns
    pagesize = determine_optimal_page_size(len(columns))
    
    # Calculate page dimensions
    page_width, page_height = pagesize
    
    # Create document with better margins - adjusted for dynamic sizing
    margin_factor = min(0.5, max(0.3, 4 / len(columns)))  # Reduce margins as columns increase
    
    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=pagesize,
        leftMargin=margin_factor*inch, 
        rightMargin=margin_factor*inch,
        topMargin=0.75*inch, 
        bottomMargin=1.0*inch,
        title=report_title
    )

    # Styles collection with improved typography
    styles = getSampleStyleSheet()
    
    # Define custom styles with better typography
    styles.add(ParagraphStyle(
        name='ReportTitle',
        fontName=f'{base_font}-Bold' if base_font == 'Roboto' else 'Helvetica-Bold',
        fontSize=22,
        leading=26,
        alignment=TA_CENTER,
        spaceAfter=12,
        textColor=BrandColors.PRIMARY
    ))
    
    styles.add(ParagraphStyle(
        name='Subtitle',
        fontName=base_font,
        fontSize=14,
        leading=18,
        alignment=TA_CENTER,
        spaceAfter=10,
        textColor=BrandColors.SECONDARY
    ))
    
    styles.add(ParagraphStyle(
        name='InfoText',
        fontName=base_font,
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=BrandColors.TEXT
    ))
    
    # Enhanced table header style with word wrap
    styles.add(ParagraphStyle(
        name='TableHeader',
        fontName=f'{base_font}-Bold' if base_font == 'Roboto' else 'Helvetica-Bold',
        fontSize=10,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.white,
        wordWrap='CJK',  # Improved word wrap
    ))
    
    # Enhanced table cell style with better word wrap
    styles.add(ParagraphStyle(
        name='TableCell',
        fontName=base_font,
        fontSize=9,
        leading=11,
        alignment=TA_LEFT,
        textColor=BrandColors.TEXT,
        wordWrap='CJK',  # Improved word wrap for cell contents
        allowWidows=0,
        allowOrphans=0,
    ))
    
    # Special style for long text columns
    styles.add(ParagraphStyle(
        name='LongTextCell',
        fontName=base_font,
        fontSize=9,
        leading=11,
        alignment=TA_JUSTIFY,  # Justified text for better appearance
        textColor=BrandColors.TEXT,
        wordWrap='CJK',
        allowWidows=0,
        allowOrphans=0,
    ))

    # Build document content
    elements = []
    
    # Add logo if available
    logo_path = get_logo_path()
    if logo_path:
        img = Image(logo_path)
        img.drawHeight = 0.75*inch
        img.drawWidth = img.drawHeight * img.imageWidth / img.imageHeight
        elements.append(img)
        elements.append(Spacer(1, 0.2*inch))
    
    # Add title section
    elements.append(Paragraph("Children's Hospital", styles['ReportTitle']))
    elements.append(Paragraph(f"{report_title}", styles['Subtitle']))
    
    # Add horizontal rule
    elements.append(Spacer(1, 0.1*inch))
    elements.append(StyledLine(doc.width, thickness=2, color=BrandColors.PRIMARY))
    elements.append(Spacer(1, 0.1*inch))
    
    # Add report info
    report_date = datetime.now().strftime("%B %d, %Y")
    elements.append(Paragraph(f"Report Date: {report_date} | Records: {len(report_data)}", styles['InfoText']))
    elements.append(Spacer(1, 0.2*inch))
    
    # Format column headers with enhanced wrapping
    header_row = []
    for col in columns:
        # Use newlines for long headers to help with wrapping
        formatted_col = col.replace(' ', '<br/>') if len(col) > 12 else col
        header_row.append(Paragraph(formatted_col, styles['TableHeader']))
    
    # Build table data with enhanced text handling
    data = [header_row]
    
    for rec in report_data:
        row = []
        for col in columns:
            cell_value = str(rec.get(col, ''))
            
            # Choose appropriate style based on content length and column type
            if len(cell_value) > 50 or col in ('Reason for Admission', 'Diagnosis', 'Comments', 'Notes'):
                # Use special style for long text
                row.append(Paragraph(cell_value, styles['LongTextCell']))
            else:
                row.append(Paragraph(cell_value, styles['TableCell']))
                
        data.append(row)

    # Calculate dynamic column widths
    available_width = doc.width
    num_cols = len(columns)
    
    # Define column width ratios based on content type
    col_width_ratios = []
    long_text_cols = ('Reason for Admission', 'Diagnosis', 'Comments', 'Notes', 'Treatment', 'Description')
    medium_text_cols = ('Child Name', 'Doctor', 'Parent Name', 'Address')
    date_cols = ('Admission Date', 'Discharge Date', 'Date', 'Birth Date')
    
    # Assign width ratios - total should sum to 100
    total_ratio = 0
    min_width_ratio = 100 / (num_cols * 2)  # Ensure every column gets some minimum width
    
    for col in columns:
        if col in long_text_cols:
            ratio = max(25, min_width_ratio)  # Longer text gets more space
        elif col in medium_text_cols:
            ratio = max(15, min_width_ratio)  # Medium text
        elif col in date_cols:
            ratio = max(10, min_width_ratio)  # Dates
        else:
            ratio = max(7, min_width_ratio)  # Default for other columns
        col_width_ratios.append(ratio)
        total_ratio += ratio
    
    # Normalize ratios to sum to 100%
    col_width_ratios = [r * 100 / total_ratio for r in col_width_ratios]
    
    # Convert percentages to actual widths
    col_widths = [available_width * ratio / 100 for ratio in col_width_ratios]
    
    # Create table with enhanced styling and dynamic sizing
    table = Table(data, colWidths=col_widths, repeatRows=1)
    
    # Define a more professional table style with improved row heights
    table_style = [
        # Header row styling
        ('BACKGROUND', (0,0), (-1,0), BrandColors.TABLE_HEADER),
        ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
        ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',   (0,0), (-1,0), 10),
        ('ALIGN',      (0,0), (-1,0), 'CENTER'),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        
        # Table body styling
        ('VALIGN',     (0,0), (-1,-1), 'TOP'),
        ('FONTSIZE',   (0,1), (-1,-1), 9),
        ('LEFTPADDING', (0,0), (-1,-1), 4),  # Reduced padding for more content space
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,1), (-1,-1), 6),
        ('TOPPADDING', (0,1), (-1,-1), 6),
        
        # Borders - subtle grid
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('BOX', (0,0), (-1,-1), 1.5, BrandColors.PRIMARY),
        ('LINEABOVE', (0,1), (-1,1), 1.5, BrandColors.PRIMARY),
    ]
    
    # Alternating row colors for better readability
    for i in range(1, len(data)):
        bg_color = BrandColors.TABLE_EVEN if i % 2 == 0 else BrandColors.TABLE_ODD
        table_style.append(('BACKGROUND', (0,i), (-1,i), bg_color))
    
    table.setStyle(TableStyle(table_style))
    elements.append(table)
    
    # Add footnote
    elements.append(Spacer(1, 0.2*inch))
    elements.append(StyledLine(doc.width, thickness=1, color=BrandColors.PRIMARY, dash=[2,2]))
    elements.append(Spacer(1, 0.1*inch))
    
    footnote_text = "This report contains confidential patient information. Please handle according to hospital privacy policies."
    elements.append(Paragraph(footnote_text, styles['InfoText']))
    
    # Custom footer with page numbers
    def add_page_number(canvas, doc):
        footer = Footer(doc, report_title)
        footer.canv = canvas
        footer.draw()
    
    # Build document with custom footer
    doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
    logger.info(f"Enhanced PDF generated at {filepath} with dynamic sizing for {len(columns)} columns")