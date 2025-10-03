from rest_framework import serializers
from ..models import Bed, AdmissionRecord, AdmissionVitalRecord, AdmissionVitalRecordHistory


class AdmissionRecordSerializer(serializers.ModelSerializer):
    child_details = serializers.SerializerMethodField()
    bed_details = serializers.SerializerMethodField()
    attending_doctor_details = serializers.SerializerMethodField()
    diagnosis_details = serializers.SerializerMethodField()
    
    bed = serializers.PrimaryKeyRelatedField(
        queryset=Bed.objects.all(),
        write_only=True
    )
    class Meta:
        model = AdmissionRecord
        fields = ['id','child', 'diagnosis', 'admission_reason', 'initial_diagnosis', 'discharge_date', 'admission_date', 'child_details', 'bed','bed_details', 'attending_doctor_details', 'diagnosis_details']
        read_only_fields = ['admission_date']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request.user, 'doctorprofile'):
            validated_data['attending_doctor'] = request.user.doctorprofile
        return super().create(validated_data)
    
    def get_child_details(self, obj):
        """Returns basic details of the child."""
        if obj.child:
            return {
                "id": obj.child.id, 
                "first_name": obj.child.first_name,
                "last_name": obj.child.last_name,
                "date_of_birth": obj.child.date_of_birth
            }
        return None

    def get_bed_details(self, obj):
        if obj.bed:
            return {
                "id": obj.bed.id,
                "bed_number": obj.bed.bed_number,
                "ward": obj.bed.ward.name
            }
        return None

    def get_attending_doctor_details(self, obj):
        if obj.attending_doctor:
            return {
                "first_name": obj.attending_doctor.first_name,
                "last_name": obj.attending_doctor.last_name,
                "email": obj.attending_doctor.user.email
            }
        return None
    def get_diagnosis_details(self, obj): 
        if obj.diagnosis: 
            return {
                "id": obj.diagnosis.id,
                "title": obj.diagnosis.title, 
                "category": obj.diagnosis.category,
                "date_diagnosed": obj.diagnosis.date_diagnosed, 
                "severity": obj.diagnosis.severity
            }
        return None


class AdmissionVitalRecordSerializer(serializers.ModelSerializer):
    # Include admission details (which gives access to the child)
    admission_details = serializers.SerializerMethodField()
    # Show details of the healthcare provider who took the vitals
    taken_by_details = serializers.SerializerMethodField()
    
    class Meta:
        model = AdmissionVitalRecord
        fields = '__all__'
        read_only_fields = ['recorded_at']
        extra_kwargs = {
            'taken_by': {'read_only': True}  # Prevent manual setting of taken_by
        }
    
    def get_admission_details(self, obj):
        if obj.admission:
            return {
                "child_id": obj.admission.child.id,
                
                "child": f"{obj.admission.child.first_name} {obj.admission.child.last_name}",
                "admission_date": obj.admission.admission_date
            }
        return None
    
  
    def get_taken_by_details(self, obj):
        user = obj.taken_by
        if not user:
            return None
        profile_data = {}
        if user.role =='doctor' and hasattr(user, 'doctorprofile'):
            profile = user.doctorprofile
            
            profile_data.update({
                "doctor_id": user.id,  
                "first_name": profile.first_name,
                "last_name": profile.last_name,
            })
        elif user.role == 'nurse' and hasattr(user, 'nurseprofile'):
            profile = user.nurseprofile
            profile_data.update({
                
                "nurse_id": user.id,  
                "first_name": profile.first_name,
                "last_name": profile.last_name,
                
            })

        return profile_data


    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user:
            validated_data['taken_by'] = request.user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request and request.user:
            validated_data['taken_by'] = request.user
        return super().update(instance, validated_data)
    

class AdmissionVitalRecordHistorySerializer(serializers.ModelSerializer):
    admission_vital_record_id = serializers.PrimaryKeyRelatedField(
        source='admission_vital_record', 
        read_only=True
    )
    updated_by_details = serializers.SerializerMethodField()
    child_details = serializers.SerializerMethodField()

    class Meta:
        model = AdmissionVitalRecordHistory
        fields = [
            'id', 'admission_vital_record_id', 'child_details','temperature', 'heart_rate', 
            'systolic', 'diastolic', 'respiratory_rate', 'oxygen_saturation', 
            'head_circumference', 'capillary_refill', 'pain_score', 
            'consciousness_level', 'glucose_level', 'hydration_status', 
            'updated_by', 'updated_by_details', 'updated_at'
        ]
    
    def get_updated_by_details(self, obj):
            user = obj.updated_by
            if not user:
                return None
            profile_data = {}
            if user.role =='doctor' and hasattr(user, 'doctorprofile'):
                profile = user.doctorprofile
                
                profile_data.update({
                    "doctor_id": user.id,  
                    "first_name": profile.first_name,
                    "last_name": profile.last_name,
                })
            elif user.role == 'nurse' and hasattr(user, 'nurseprofile'):
                profile = user.nurseprofile
                profile_data.update({
                    
                    "nurse_id": user.id,  
                    "first_name": profile.first_name,
                    "last_name": profile.last_name,
                    
                })

            return profile_data
        
    def get_child_details(self, obj):
        child = obj.admission_vital_record.admission.child
        admission_date = obj.admission_vital_record.admission.admission_date
        if child:
            return {
                
                "child": f"{child.first_name} {child.last_name}",
                "age": child.age,
                "gender": child.gender,
                "admission_date": admission_date
            }
        return None
        
         
            
