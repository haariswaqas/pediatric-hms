from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from ..models import VaccinationRecord

@registry.register_document
class VaccinationRecordDocument(Document):
    child_first_name = fields.TextField(attr="child.first_name")
    child_last_name = fields.TextField(attr="child.last_name")
    vaccine = fields.TextField(attr="vaccine.name")
    
    class Index:
        name = "vaccination-records"
        settings = {
             "number_of_shards": 1,
            "number_of_replicas": 0
        }
    
    class Django:
        model = VaccinationRecord
        fields = [
"id", "dose_number", "scheduled_date", "is_administered", "administered_date", "status", "batch_number", "notes"            
        ]