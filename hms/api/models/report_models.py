from django.db import models
from .auth_models import User

class ReportFormat(models.TextChoices):
    CSV = 'csv', 'CSV'
    XLSX = 'xlsx', 'Excel'
    PDF = 'pdf', 'PDF'

class ReportType(models.TextChoices):
    ADMISSION = 'admission', 'Admission Report'
    DISCHARGE = 'discharge', 'Discharge Report'

class Report(models.Model):
    """Model to store generated reports"""
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='reports/')
    report_type = models.CharField(max_length=20, choices=ReportType.choices)
    format = models.CharField(max_length=10, choices=ReportFormat.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    record_count = models.IntegerField(default=0)
    
    # Users with access to this report
    users = models.ManyToManyField(User, related_name='accessible_reports')
    
    # For tracking email delivery
    emailed = models.BooleanField(default=False)
    emailed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} ({self.format}) - {self.created_at.strftime('%Y-%m-%d')}"