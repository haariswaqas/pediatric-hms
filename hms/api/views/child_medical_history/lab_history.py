from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from .pdf import *

def lab_history(child, styles, story):
    """Append the lab requests and results section for the given child to the PDF story."""
    lab_requests = child.lab_requests.all().order_by("-date_requested")

    if lab_requests.exists():
        # Enhanced summary info
        total_requests = lab_requests.count()
        completed_requests = lab_requests.filter(status='completed').count()
        pending_requests = lab_requests.filter(status__in=['pending', 'in_progress']).count()
        
        story.append(Paragraph(
            f"<b>Summary:</b> {total_requests} total requests | {completed_requests} completed | {pending_requests} pending", 
            styles['Detail']
        ))
        story.append(Spacer(1, 0.15*inch))

        for req_index, req in enumerate(lab_requests):
            # Request header with enhanced styling
            request_header_data = [
                ["Request ID", "Date Requested", "Status", "Priority", "Requested By"],
                [
                    req.request_id or 'N/A',
                    req.date_requested.strftime('%Y-%m-%d %H:%M'),
                    req.status.title(),
                    req.priority.upper() if req.priority else 'NORMAL',
                    f"Dr. {req.requested_by.first_name} {req.requested_by.last_name}" if req.requested_by else "N/A"
                ]
            ]
            
            request_table = Table(request_header_data, colWidths=[1.2*inch, 1.5*inch, 1.0*inch, 1.0*inch, 1.8*inch])
            request_table.setStyle(TableStyle([
                # Header row
                ('BACKGROUND', (0,0), (-1,0), BrandColors.ACCENT),
                ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('FONTSIZE', (0,0), (-1,0), 10),
                # Data row
                ('FONTNAME', (0,1), (-1,1), 'Helvetica'),
                ('FONTSIZE', (0,1), (-1,1), 9),
                ('BACKGROUND', (0,1), (-1,1), BrandColors.LIGHT_BG),
                # Formatting
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('GRID', (0,0), (-1,-1), 1, BrandColors.ACCENT),
                ('LEFTPADDING', (0,0), (-1,-1), 6),
                ('RIGHTPADDING', (0,0), (-1,-1), 6),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ]))
            
            # Status-based coloring
            status_color = BrandColors.SUCCESS if req.status.lower() == 'completed' else BrandColors.WARNING
            if req.status.lower() in ['cancelled', 'failed']:
                status_color = BrandColors.ACCENT
            request_table.setStyle(TableStyle([('TEXTCOLOR', (2,1), (2,1), status_color)]))
            
            story.append(request_table)
            story.append(Spacer(1, 0.1*inch))

            # Show test items and results
            if req.test_items.exists():
                for item in req.test_items.all():
                    story.append(Paragraph(f"<b>Test:</b> {item.lab_test}", styles['Detail']))
                    
                    # Results for this test item
                    if item.results.exists():
                        for result in item.results.all():
                            story.append(Paragraph(
                                f"<i>Lab Technician: {result.performed_by.first_name} {result.performed_by.last_name} "
                                f"on {result.date_performed.strftime('%Y-%m-%d %H:%M')}</i>",
                                styles['Detail']
                            ))

                            # Results parameters table
                            if result.parameters.exists():
                                param_data = [["Parameter", "Result", "Status"]]
                                
                                for param in result.parameters.all():
                                    value_with_unit = (
                                        f"{param.value} {param.unit}" 
                                        if param.value is not None else "No result"
                                    )
                                  
                                    param_status = param.status or "—"
                                    
                                    param_data.append([
                                        param.parameter_name,
                                        value_with_unit,
                                        
                                        param_status.title()
                                    ])
                                
                                param_table = Table(param_data, colWidths=[1.8*inch, 1.5*inch, 1.0*inch])
                                param_table.setStyle(TableStyle([
                                    # Header styling
                                    ('BACKGROUND', (0,0), (-1,0), BrandColors.PRIMARY),
                                    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                                    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                                    ('FONTSIZE', (0,0), (-1,0), 9),
                                    # Data styling
                                    ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
                                    ('FONTSIZE', (0,1), (-1,-1), 8),
                                    ('ALIGN', (1,1), (-1,-1), 'CENTER'),
                                    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                                    # Grid and borders
                                    ('GRID', (0,0), (-1,-1), 0.5, BrandColors.PRIMARY),
                                    ('LEFTPADDING', (0,0), (-1,-1), 4),
                                    ('RIGHTPADDING', (0,0), (-1,-1), 4),
                                    ('TOPPADDING', (0,0), (-1,-1), 3),
                                    ('BOTTOMPADDING', (0,0), (-1,-1), 3),
                                    # Alternating row colors
                                    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BrandColors.LIGHT_BG]),
                                ]))
                                
                                # Apply status-based coloring
                                for i, row in enumerate(param_data[1:], 1):
                                    if row[2].lower() in ['high', 'elevated', 'abnormal']:
                                        param_table.setStyle(TableStyle([('TEXTCOLOR', (3,i), (3,i), BrandColors.ACCENT)]))
                                    elif row[2].lower() in ['low', 'decreased']:
                                        param_table.setStyle(TableStyle([('TEXTCOLOR', (3,i), (3,i), BrandColors.WARNING)]))
                                    elif row[2].lower() in ['normal', 'within range']:
                                        param_table.setStyle(TableStyle([('TEXTCOLOR', (3,i), (3,i), BrandColors.SUCCESS)]))
                                
                                story.append(param_table)
                                story.append(Spacer(1, 0.1*inch))
                    else:
                        story.append(Paragraph("<i>No results available yet</i>", styles['Detail']))
                        story.append(Spacer(1, 0.05*inch))

            # Separator between requests (except for the last one)
            if req_index < len(lab_requests) - 1:
                story.append(Spacer(1, 0.15*inch))
                # Add a subtle divider line
                from reportlab.platypus import Flowable
                class ThinLine(Flowable):
                    def __init__(self, width):
                        Flowable.__init__(self)
                        self.width = width
                        self.height = 1
                    def draw(self):
                        self.canv.setStrokeColor(BrandColors.SECONDARY)
                        self.canv.setLineWidth(0.5)
                        self.canv.setDash([3, 2])  # Dashed line
                        self.canv.line(0, 0, self.width, 0)
                
                story.append(ThinLine(6.5*inch))
                story.append(Spacer(1, 0.15*inch))

    else:
        story.append(Paragraph(
            "🔬 No laboratory history available for this patient.", 
            styles['Detail']
        ))

    story.append(Spacer(1, 0.2*inch))