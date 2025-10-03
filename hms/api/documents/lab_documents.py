from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from ..models import LabRequestItem, LabResultParameter

@registry.register_document
class LabRequestItemDocument(Document):
    child_first_nmame = fields.TextField(attr="lab_request.child.first_name")
    child_last_name = fields.TextField(attr="lab_request.child.last_name")
    
    doctor_first_name = fields.TextField(attr="lab_request.requested_by.first_name")
    doctor_last_name = fields.TextField(attr="lab_request.requested_by.last_name")
    
    lab_test_code = fields.TextField(attr="lab_request.lab_test.code")
    lab_test_name = fields.TextField(attr="lab_request.lab_test.name")
    
    
    class Index:
        name = "lab-request-items"
        settings = {
             "number_of_shards": 1,
            "number_of_replicas": 0
        }
        
    class Django:
        model = LabRequestItem
        fields = ["id", "notes"]


@registry.register_document
class LabResultParameterDocument(Document):
    child_first_nmame = fields.TextField(attr="lab_result.lab_request_item.lab_request.child.first_name")
    child_last_name = fields.TextField(attr="lab_result.lab_request_item.lab_request.child.last_name")
    
    doctor_first_name = fields.TextField(attr="lab_result.lab_request_item.lab_request.requested_by.first_name")
    doctor_last_name = fields.TextField(attr="lab_result.lab_request_item.lab_request.requested_by.last_name")
    
    lab_test_code = fields.TextField(attr="lab_result.lab_request_item.lab_test.code")
    lab_test_name = fields.TextField(attr="lab_result.lab_request_item.lab_test.name")


    class Index: 
        name = "lab-result-parameters"
        settings = {
             "number_of_shards": 1,
            "number_of_replicas": 0
        }
        
    class Django:
        model = LabResultParameter
        fields = ["id", "parameter_name", "value", "unit", "status", "notes"]
        