from django_elasticsearch_dsl import Document
from django_elasticsearch_dsl.registries import registry

from ..models import (DoctorProfile, NurseProfile, PharmacistProfile, LabTechProfile)

@registry.register_document
class DoctorProfileDocument(Document):
    class Index:
        name = "doctorprofiles"
        settings = {"number_of_shards": 1, "number_of_replicas": 0}
        
    class Django:
        model = DoctorProfile
        fields = ['first_name', 'last_name', 'specialization']


@registry.register_document
class NurseProfileDocument(Document):
    class Index:
        name = "nurseprofiles"
        settings = {"number_of_shards": 1, "number_of_replicas": 0}
        
    class Django:
        model = NurseProfile
        fields = ['first_name', 'last_name', 'nursing_license_number']


@registry.register_document
class PharmacistProfileDocument(Document):
    class Index:
        name = "pharmacistprofiles"
        settings = {"number_of_shards": 1, "number_of_replicas": 0}
        
    class Django:
        model = PharmacistProfile
        fields = ['first_name', 'last_name', 'pharmacy_license_number']


@registry.register_document
class LabTechProfileDocument(Document):
    class Index:
        name = "labtechprofiles"
        settings = {"number_of_shards": 1, "number_of_replicas": 0}
        
    class Django:
        model = LabTechProfile
        fields = ['first_name', 'last_name']
