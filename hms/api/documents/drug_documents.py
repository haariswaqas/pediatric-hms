from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from ..models import Drug, DrugInteraction

@registry.register_document
class DrugDocument(Document):
    class Index:
        name = "drugs"
        settings = {
            "number_of_shards": 1,
            "number_of_replicas": 0
        }
        
    class Django:
        model = Drug
        fields = [
            "id",
            "name",
            "generic_name",
            "brand_name",
            "description",
            "ndc_code",
            "category",
            "dosage_form",
            "route",
            "strength",
            "concentration",
            "manufacturer",
            "price_per_unit",
            "quantity_in_stock",
            "reorder_level",
            "is_available",
            "batch_number",
            "expiration_date",
            "requires_weight_based_dosing",
            "minimum_age_months",
            "maximum_age_months",
            "minimum_weight_kg",
            "pediatric_notes",
            "special_storage",
            "controlled_substance",
            "controlled_substance_class",
            "created_at",
            "updated_at"
        ]


@registry.register_document
class DrugInteractionDocument(Document):
    drug_one_name = fields.TextField(attr="drug_one.name")
    drug_two_name = fields.TextField(attr="drug_two.name")

    class Index:
        name = "drug_interactions"
        settings = {
            "number_of_shards": 1,
            "number_of_replicas": 0
        }
        
    class Django:
        model = DrugInteraction
        fields = [
            "id",
            "severity",
            "description",
            "alternative_suggestion",
        ]