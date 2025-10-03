from rest_framework.serializers import ModelSerializer, SerializerMethodField
from ..models import LabResult, LabResultParameter
from rest_framework.exceptions import PermissionDenied

class LabResultSerializer(ModelSerializer):
    lab_request_item_details = SerializerMethodField()
    performed_by_details = SerializerMethodField()
    
    class Meta:
        model = LabResult
        fields = '__all__'
        
    def get_lab_request_item_details(self, obj):
        lab_test = obj.lab_request_item.lab_test
        child = obj.lab_request_item.lab_request.child
        doctor = obj.lab_request_item.lab_request.requested_by
        date_requested = obj.lab_request_item.lab_request.date_requested
        
        if lab_test:
            return {
                "id": lab_test.id,
                "lab_test": f"{lab_test.name} ({lab_test.code})",
                "child": f"{child.first_name} {child.last_name}", 
                "doctor": f"Dr. {doctor.first_name} {doctor.last_name}",
                "date_requested": date_requested
                
            }
        return None
    
    def get_performed_by_details(self, obj):
        pharmacist = obj.performed_by
        if pharmacist:
            return {"id": pharmacist.id, "name":f"{pharmacist.first_name} {pharmacist.last_name}"}
        return None
    
    def create(self, validated_data):
        request = self.context.get('request')
        if not request or not hasattr(request.user, 'labtechprofile'):
            raise PermissionDenied("only lab techs can create lab results")
        
        
        lab_tech = request.user.labtechprofile
        validated_data['performed_by'] = lab_tech
        validated_data['verified_by'] = lab_tech
        return super().create(validated_data)
        
        
class LabResultParameterSerializer(ModelSerializer):
    lab_tech_details = SerializerMethodField()
    doctor_details = SerializerMethodField()
    child_details = SerializerMethodField()
    lab_result_details = SerializerMethodField()
    reference_range_details = SerializerMethodField()
    
    class Meta:
        model = LabResultParameter
        fields = '__all__'
        
    def get_lab_tech_details(self, obj):
        lab_tech = obj.lab_result.performed_by
        if lab_tech: 
            return {
                "id": lab_tech.id,
                "name": f"{lab_tech.first_name} {lab_tech.first_name}"
            }
        return None
    
    def get_doctor_details(self, obj):
        doctor = obj.lab_result.lab_request_item.lab_request.requested_by
        if doctor:
            return {
                "id": doctor.id,
                "name": f"Dr. {doctor.first_name} {doctor.last_name}"
            }
        return None
    
    def get_child_details(self, obj):
        child = obj.lab_result.lab_request_item.lab_request.child
        if child: 
            return {"id": child.id, "name": f"{child.first_name} {child.last_name}", "age": child.age}
        return None
    def get_lab_result_details(self, obj):
        if obj.lab_result:
            return {
                "id": obj.lab_result.id
            }
        return None
            
    def get_reference_range_details(self, obj):
        reference = obj.reference_range
        if reference:
            return {
                "id": reference.id, 
                "parameter_name": reference.parameter_name,
                "range": f"{reference.min_value} - {reference.max_value} {reference.unit} is normal for {reference.gender} Gender",
                "normal_range": f"{reference.min_value} - {reference.max_value} {obj.value} {obj.unit}"
            }
        return None
    
    