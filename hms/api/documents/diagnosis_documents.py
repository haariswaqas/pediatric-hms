from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from ..models import Diagnosis

@registry.register_document
class DiagnosisDocument(Document):
    child_first_name = fields.TextField(attr="child.first_name")
    child_last_name = fields.TextField(attr="child.last_name")
    doctor_first_name = fields.TextField(attr="doctor.first_name")
    doctor_last_name = fields.TextField(attr="doctor.last_name")
    
    class Index:
        name = "diagnoses"
        settings = {
            "number_of_shards": 1,
            "number_of_replicas": 0
        }
        
    class Django:
        model = Diagnosis
        fields = [
"id", "icd_code", "title", "description", "status", "severity", "onset_date", 
"date_diagnosed", "resolution_date", "is_chronic", "is_congenital", "clinical_findings", "notes"
        ]