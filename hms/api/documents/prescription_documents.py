from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from ..models import PrescriptionItem

@registry.register_document
class PrescriptionItemDocument(Document):
    child_first_name = fields.TextField(attr="prescription.child.first_name")
    child_last_name = fields.TextField(attr="prescription.child.last_name")
    doctor_first_name = fields.TextField(attr="prescription.doctor.first_name")
    doctor_last_name = fields.TextField(attr="prescription.doctor.last_name")
    drug_name = fields.TextField(attr="drug.name")
    prescription_status = fields.TextField(attr="prescription.status")
    drug_brand_name = fields.TextField(attr="drug.brand_name")
    drug_generic_name = fields.TextField(attr="drug.generic_name")
    drug_category = fields.TextField(attr="drug.category")
    
    class Index:
        name = "prescription-items"
        settings = {
             "number_of_shards": 1,
            "number_of_replicas": 0
        }
        
    class Django:
        model = PrescriptionItem
        fields = [
"id","dosage", "frequency", "duration_value", "duration_unit", "max_refills", "refills_used", "instructions", "is_weight_based", "dose_per_kg", "min_dose", "max_dose"
        ]
    