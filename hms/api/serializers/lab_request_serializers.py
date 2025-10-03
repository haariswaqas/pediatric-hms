from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, SerializerMethodField
from ..models import LabRequest, LabRequestItem
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

class LabRequestSerializer(serializers.ModelSerializer):
    child_details = serializers.SerializerMethodField()
    requested_by_details = serializers.SerializerMethodField()
    
    class Meta:
        model = LabRequest
        fields = '__all__'
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request.user, 'doctorprofile'):
            validated_data['requested_by'] = request.user.doctorprofile
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = request.user if request else None

        new_status = validated_data.get('status', instance.status)

        # Auto-assign sample_collected_by
        if new_status == 'COLLECTED' and instance.sample_collected_by is None:
            if hasattr(user, 'labtechprofile'):
                instance.sample_collected_by = user.labtechprofile
                instance.sample_collection_date = timezone.now()
            else:
                raise PermissionDenied("Only lab technicians can collect samples.")

        # Auto-assign verified_by
        if new_status == 'VERIFIED' and instance.verified_by is None:
            if hasattr(user, 'labtechprofile'):
                instance.verified_by = user.labtechprofile
                instance.results_date = timezone.now()
            else:
                raise PermissionDenied("Only lab technicians can verify results.")

        return super().update(instance, validated_data)

    def get_child_details(self, obj):
        child = obj.child
        if child: 
            return {
                "id": child.id,
                "first_name": child.first_name,
                "last_name": child.last_name,
                "age": child.age
            }
        return None
            
    def get_requested_by_details(self, obj):
        doctor = obj.requested_by
        if doctor:
            return {
                "id": doctor.id,
                "first_name": doctor.first_name,
                "last_name": doctor.last_name
            }
        return None

class LabRequestItemSerializer(serializers.ModelSerializer):
    lab_test_details = SerializerMethodField()
    child_details = SerializerMethodField()
    lab_request_details = SerializerMethodField()
    
    class Meta:
        model = LabRequestItem
        fields = '__all__'
    
    def get_lab_request_details(self, obj):
        request = obj.lab_request
        doctor = obj.lab_request.requested_by
        child = obj.lab_request.child
        if request:
            return {
                "id": request.request_id,
                "doctor": f"Dr. {doctor.first_name} {doctor.last_name}",
                "child": f"{child.first_name} {child.last_name}",
                "date_requested": request.date_requested, 
                "status": request.status, 
                "priority": request.priority
            }
        return None
    
    def get_lab_test_details(self, obj):
        test = obj.lab_test
        if test:
            return {"id": test.id, "code": test.code, "name": test.name, 
                    "sample_type": test.sample_type, "sample_volume_required": test.sample_volume_required}
        return None
    
    def get_child_details(self, obj):
        child = obj.lab_request.child
        if child:
            return { "id": child.id, "first_name": child.first_name, "last_name": child.last_name}
        return None