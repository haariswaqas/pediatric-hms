# chatbot/views.py
import io
from django.http import FileResponse, Http404
from rest_framework.views import APIView
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Flowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import letter  # Added missing import
from reportlab.lib import colors
from datetime import datetime

from ..models import Conversation, Message
from .child_medical_history.pdf import BrandColors, StyledLine, Footer

class ConversationPDFView(APIView):
    """
    Generate a polished PDF of a conversation with alternating colors, timestamps, and wrapped messages.
    """

    def get(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(pk=conversation_id, user=request.user)
        except Conversation.DoesNotExist:
            raise Http404("Conversation not found")

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                                rightMargin=0.5*inch,
                                leftMargin=0.5*inch,
                                topMargin=0.75*inch,
                                bottomMargin=1*inch)
        styles = getSampleStyleSheet()
        story = []

        # Main Title
        title_text = f"Chat Conversation Export"
        story.append(Paragraph(
            title_text,
            ParagraphStyle('MainTitle', fontSize=20, leading=24, spaceAfter=8,
                           textColor=BrandColors.PRIMARY, alignment=1, fontName='Helvetica-Bold')
        ))

        # Subtitle with conversation info
        subtitle_text = f"{conversation.title or f'Session {conversation.session_id}'}"
        story.append(Paragraph(
            subtitle_text,
            ParagraphStyle('Subtitle', fontSize=14, leading=16, spaceAfter=6,
                           textColor=BrandColors.SECONDARY, alignment=1, fontName='Helvetica')
        ))

        # Generation timestamp
        story.append(Paragraph(
            f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
            ParagraphStyle('Timestamp', fontSize=10, textColor=BrandColors.TEXT, spaceAfter=16, alignment=1)
        ))
        
        story.append(StyledLine(width=doc.width, thickness=2, color=BrandColors.PRIMARY))
        story.append(Spacer(1, 0.3*inch))

        # Enhanced alternating colors with better contrast
        user_bg = colors.Color(0.95, 0.98, 1.0)  # Light blue tint
        assistant_bg = colors.Color(0.98, 0.98, 0.95)  # Light cream/yellow tint

        # Messages with improved styling
        for i, msg in enumerate(conversation.messages.all()):
            timestamp_str = msg.created_at.strftime("%b %d, %Y %I:%M %p")
            if msg.role == "user":
                prefix = "👤 You"
                bg_color = user_bg
                text_color = colors.Color(0.1, 0.2, 0.5)  # Darker blue
                border_color = colors.Color(0.3, 0.5, 0.8)  # Medium blue border
            else:
                prefix = "🤖 Assistant"
                bg_color = assistant_bg
                text_color = colors.Color(0.2, 0.4, 0.1)  # Dark green
                border_color = colors.Color(0.5, 0.7, 0.3)  # Medium green border

            # Show full message content without truncation
            content = msg.content
            
            # Escape HTML characters in content to prevent rendering issues
            import html
            content = html.escape(content)
            
            # Create header with role and timestamp
            header_style = ParagraphStyle(
                'MessageHeader',
                fontSize=10,
                leading=12,
                textColor=text_color,
                backColor=bg_color,
                leftIndent=8,
                rightIndent=8,
                spaceBefore=8,
                spaceAfter=4,
                borderPadding=4,
                fontName='Helvetica-Bold'
            )
            
            story.append(Paragraph(
                f"{prefix} • <font size='9' color='#666666'>{timestamp_str}</font>",
                header_style
            ))

            # Add small spacer between header and content
            story.append(Spacer(1, 0.05*inch))

            # Message content with better styling
            para_style = ParagraphStyle(
                'MessageContent',
                fontSize=10,
                leading=14,
                textColor=colors.black,
                backColor=bg_color,
                leftIndent=12,
                rightIndent=12,
                spaceAfter=16,
                spaceBefore=0,
                borderPadding=6,
                borderWidth=1,
                borderColor=border_color,
                borderRadius=2,
                allowWidows=1,
                allowOrphans=1,
            )
            story.append(Paragraph(content, para_style))

        story.append(Spacer(1, 0.3*inch))

        # Footer on each page
        def add_footer(canvas, doc):
            footer = Footer(doc, child_name=request.user.get_full_name() or request.user.username)
            footer.canv = canvas
            footer.draw()

        doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)

        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f"conversation_{conversation_id}.pdf")