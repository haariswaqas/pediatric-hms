# lab_request_models.py
from django.db import models
from django.utils import timezone

class LabRequest(models.Model):
   
    STATUS_CHOICES = [
        ('ORDERED', 'Ordered'),
        ('SCHEDULED', 'Scheduled'),
        ('COLLECTED', 'Sample Collected'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Results Complete'),
        ('VERIFIED', 'Results Verified'),
        ('CANCELLED', 'Cancelled'),
        ('REJECTED', 'Sample Rejected')
    ]
    
    PRIORITY_CHOICES = [
        ('ROUTINE', 'Routine'),
        ('URGENT', 'Urgent'),
        ('STAT', 'STAT (Immediate)')
    ]
    
    child = models.ForeignKey('Child', on_delete=models.CASCADE, related_name='lab_requests')
    requested_by = models.ForeignKey('DoctorProfile', on_delete=models.SET_NULL, null=True, related_name='lab_requests_ordered')
    diagnosis = models.ForeignKey('Diagnosis', on_delete=models.SET_NULL, null=True, blank=True, related_name='lab_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ORDERED')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='ROUTINE')
    
    request_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    date_requested = models.DateTimeField(auto_now_add=True)
    scheduled_date = models.DateTimeField(blank=True, null=True)
    sample_collection_date = models.DateTimeField(blank=True, null=True)
    sample_collected_by = models.ForeignKey('LabTechProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='samples_collected')
    
    results_date = models.DateTimeField(blank=True, null=True)
    verified_by = models.ForeignKey('LabTechProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='lab_results_verified')
    
    
    clinical_notes = models.TextField(blank=True, null=True, help_text="Clinical information relevant to test interpretation")
    special_instructions = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    is_fasting = models.BooleanField(default=False)
    
    # Billing information
    is_billable = models.BooleanField(default=False)
    
    
    def get_total_cost(self):
        """Calculate the total cost of all tests in this request"""
        return sum(item.test.price for item in self.test_items.all())
    
    def save(self, *args, **kwargs):
        # Generate a unique request ID if not provided
        if not self.request_id:
            # Format: LR-YYYYMMDD-XXXX (where XXXX is a sequential number)
            today = timezone.now().strftime('%Y%m%d')
            last_request = LabRequest.objects.filter(request_id__startswith=f"LR-{today}").order_by('request_id').last()
            
            if last_request:
                last_seq = int(last_request.request_id.split('-')[-1])
                new_seq = last_seq + 1
            else:
                new_seq = 1
                
            self.request_id = f"LR-{today}-{new_seq:04d}"
            
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.request_id} ({self.id}) - {self.child} ({self.get_status_display()})"


class LabRequestItem(models.Model):
    lab_request = models.ForeignKey(LabRequest, on_delete=models.CASCADE, related_name='test_items')
    lab_test = models.ForeignKey('LabTest', on_delete=models.CASCADE)
    notes = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.lab_test.name} for {self.lab_request.request_id}"
    
    class Meta:
        unique_together = ('lab_request', 'lab_test')



