import io
from django.http import FileResponse
from rest_framework.views import APIView
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Flowable, Image
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from datetime import datetime


class BrandColors:
    PRIMARY = colors.Color(0.2, 0.4, 0.7)  # Blue
    SECONDARY = colors.Color(0.3, 0.6, 0.8)  # Light Blue
    TEXT = colors.Color(0.2, 0.2, 0.2)  # Dark Gray
    LIGHT_BG = colors.Color(0.95, 0.97, 0.99)  # Very Light Blue
    SUCCESS = colors.Color(0.2, 0.7, 0.3)  # Green
    WARNING = colors.Color(0.9, 0.7, 0.1)  # Orange
    ACCENT = colors.Color(0.8, 0.2, 0.4)  # Medical Red

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
    def __init__(self, doc, child_name):
        Flowable.__init__(self)
        self.doc = doc
        self.child_name = child_name
        # Use the full page width instead of doc.width
        from reportlab.lib.pagesizes import letter
        self.width = letter[0]  # Full page width
        self.height = 0.75*inch

    def draw(self):
        self.canv.saveState()
        
        # Get the actual page dimensions
        page_width = self.canv._pagesize[0]
        
        self.canv.setFillColor(BrandColors.LIGHT_BG)
        self.canv.rect(0, 0, page_width, self.height, fill=1, stroke=0)
        self.canv.setStrokeColor(BrandColors.PRIMARY)
        self.canv.setLineWidth(2)
        self.canv.line(0, self.height, page_width, self.height)
        self.canv.setFillColor(BrandColors.TEXT)
        self.canv.setFont('Helvetica', 8)
        page_num = self.canv.getPageNumber()
        self.canv.drawCentredString(page_width/2, self.height/3,
            f"CONFIDENTIAL MEDICAL RECORD - Page {page_num} - {self.child_name}")
        self.canv.setFont('Helvetica', 7)
        self.canv.drawString(10, 10, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        self.canv.drawRightString(page_width-10, 10, "© Children's Hospital")
        self.canv.restoreState()