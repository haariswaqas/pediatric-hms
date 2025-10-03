from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from ..models import AdmissionRecord

@registry.register_document
class AdmissionDocument(Document):
    child_first_name = fields.TextField(attr="child.first_name")
    child_last_name = fields.TextField(attr="child.last_name")
    doctor_first_name = fields.TextField(attr="attending_doctor.first_name")
    doctor_last_name = fields.TextField(attr="attending_doctor.last_name")

    class Index: 
        name = "admissions"
        settings = {
             "number_of_shards": 1,
            "number_of_replicas": 0
        }
        
    class Django: 
        model = AdmissionRecord
        fields = [
            "id", "admission_reason", "initial_diagnosis", "admission_date", "discharge_date",
        ]
        
