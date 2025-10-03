from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from ..models import Appointment

@registry.register_document
class AppointmentDocument(Document):
    child_first_name = fields.TextField(attr="child.first_name")
    child_last_name = fields.TextField(attr="child.last_name")
    doctor_first_name = fields.TextField(attr="doctor.first_name")
    doctor_last_name = fields.TextField(attr="doctor.last_name")

    class Index:
        name = "appointments"
        settings = {
            "number_of_shards": 1,
            "number_of_replicas": 0
        }

    class Django:
        model = Appointment
        fields = [
            "id",
            "appointment_date",
            "appointment_time",
            "status",
            "reason",
            "created_at",
            "updated_at",
        ]


   