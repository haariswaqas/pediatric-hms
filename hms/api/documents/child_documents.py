from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from ..models import Child

@registry.register_document
class ChildDocument(Document):
    primary_guardian_name = fields.TextField(attr="get_primary_guardian_name")
    secondary_guardian_name = fields.TextField(attr="get_secondary_guardian_name")
    

    class Index:
        name = "childs"  # Elasticsearch index name

    class Django:
        model = Child
        fields = [
            "first_name",
            "middle_name",
            "last_name",
            "gender",
            "blood_group",
            "date_of_birth",
            "age",
        ]

    def get_primary_guardian_name(self, obj):
        """Return primary guardian name or empty string if None."""
        return obj.primary_guardian.parentprofile.first_name if obj.primary_guardian else ""

    def get_secondary_guardian_name(self, obj):
        """Return secondary guardian name or empty string if None."""
        return obj.secondary_guardian.parentprofile.first_name if obj.secondary_guardian else ""
