from rest_framework.serializers import ModelSerializer, PrimaryKeyRelatedField, SerializerMethodField
from ..models import DoctorProfile, Child, Diagnosis, Drug, Prescription, PrescriptionItem


class PrescriptionSerializer(ModelSerializer):
    doctor = PrimaryKeyRelatedField(queryset=DoctorProfile.objects.all(), required=False)
    child = PrimaryKeyRelatedField(queryset=Child.objects.all(), required=False)
    diagnosis = PrimaryKeyRelatedField(queryset=Diagnosis.objects.all(), required=False)
    
    # Change this line to use nested serializer instead of read_only
    
    doctor_details = SerializerMethodField()
    child_details = SerializerMethodField()
    diagnosis_details = SerializerMethodField()
    
    class Meta:
        model = Prescription
        fields = [
            'id', 'doctor', 'doctor_details', 'child', 'child_details', 'diagnosis', 'diagnosis_details', 
            'weight_at_prescription','date_prescribed', 'valid_from', 'valid_until', 'notes', 'status' 
        ]
        read_only_fields = ['date_prescribed', 'valid_from']
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request.user, 'doctorprofile'):
            validated_data['doctor'] = request.user.doctorprofile
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
    
    def get_doctor_details(self, obj):
        if obj.doctor:
            return {
                "id": obj.doctor.id,
                "first_name": obj.doctor.first_name,
                "last_name": obj.doctor.last_name
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
class PrescriptionItemSerializer(ModelSerializer):
    drug = PrimaryKeyRelatedField(queryset=Drug.objects.all(), required=True)
    prescription = PrimaryKeyRelatedField(
        queryset=Prescription.objects.all(), required=True
    )
   
    drug_details = SerializerMethodField()
    prescription_details = SerializerMethodField()
    full_duration = SerializerMethodField()
    refills_remaining = SerializerMethodField()
    is_refillable = SerializerMethodField()

    class Meta:
        model = PrescriptionItem
        fields = [
            "id",
            "prescription",
            "prescription_details",
            "drug",
            "drug_details",
            
            "dosage",
            "frequency",
            "duration_value",
            "duration_unit",
            "full_duration",
            "max_refills",
            "refills_used",
            "refills_remaining",
            "is_refillable",
            "instructions",
            "is_weight_based",
            "dose_per_kg",
            "min_dose",
            "max_dose",
        ]

    def get_drug_details(self, obj):
        if not obj.drug:
            return None
        return {
            "id": obj.drug.id,
            "name": obj.drug.name,
            "strength": obj.drug.strength,
            "quantity" :obj.drug.quantity_in_stock
        }

   
    def get_prescription_details(self, obj):
        p = obj.prescription
        if not p:
            return None

        # doctor or child might be null if you allowed that in your model
        doctor = getattr(p, "doctor", None)
        child = getattr(p, "child", None)
        return {
            
            "id": p.id,
            "doctor_id": doctor.id,
            "child_id": child.id,
            "doctor_first_name": doctor.first_name if doctor else None,
            "doctor_last_name": doctor.last_name if doctor else None,
            "child_first_name": child.first_name if child else None,
            "child_last_name": child.last_name if child else None,
            "prescription_valid_from": p.valid_from,
            "prescription_valid_until": p.valid_until,
            "prescription_status": p.status,
            
        }

    def get_full_duration(self, obj):
        return obj.full_duration()

    def get_refills_remaining(self, obj):
        return obj.refills_remaining()

    def get_is_refillable(self, obj):
        return obj.is_refillable()    

