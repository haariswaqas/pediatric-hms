from rest_framework import serializers
from ..models import Drug, DrugInteraction, DrugDispenseRecord, PharmacistProfile
from .prescription_serializers import PrescriptionItemSerializer



# --- Drug Serializer ---
class DrugSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drug
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['is_low_stock'] = instance.is_low_stock()
        return data
    

class DrugBulkUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    
    def validate_file(self, file):
        if not file.name.endswith(('.xls', 'xlsx', 'csv')):
            raise serializers.ValidationError("the file must be an xls, xlsx or csv format.")
        return file


# --- DrugInteraction Serializer ---
class DrugInteractionSerializer(serializers.ModelSerializer):
    drug_one_id = serializers.CharField(source='drug_one.id', read_only=True)
    drug_two_id = serializers.CharField(source='drug_two.id', read_only=True)
    drug_one_name = serializers.CharField(source='drug_one.name', read_only=True)
    drug_two_name = serializers.CharField(source='drug_two.name', read_only=True)

    class Meta:
        model = DrugInteraction
        fields = [
            'id',
            'drug_one', 'drug_one_name',
            'drug_two', 'drug_two_name',
            'drug_one_id', 'drug_two_id',
            'severity',
            'description',
            'alternative_suggestion',
        ]


# --- DrugDispenseRecord Serializer ---
class DrugDispenseRecordSerializer(serializers.ModelSerializer):
    
    pharmacist_details = serializers.SerializerMethodField()
    doctor_details = serializers.SerializerMethodField()
    prescription_item_details =serializers.SerializerMethodField()
   
    class Meta:
        model = DrugDispenseRecord
        fields = [
            'id',
            'pharmacist', 'pharmacist_details', 'doctor_details',
            'prescription_item', 'prescription_item_details',
            'quantity_dispensed',
            'batch_number',
            'date_dispensed',
            'dispensing_notes',
            'is_refill',
        ]
        read_only_fields = ['date_dispensed', 'pharmacist']

    def get_pharmacist_details(self, obj):
        pharmacist = obj.pharmacist
        if pharmacist:
            
            return {
                'id': pharmacist.id,
                'first_name': pharmacist.first_name,
                'last_name': pharmacist.last_name,
               
            }
        return None
    def get_prescription_item_details(self, obj):
        prescription_item = obj.prescription_item
        if prescription_item:
            return {
                'id': prescription_item.id,
                'drug_name': prescription_item.drug.name,
                'dosage': prescription_item.dosage,
                'frequency': prescription_item.frequency, 
                'duration_value': prescription_item.duration_value,
                'duration_unit': prescription_item.duration_unit
            }
        return None
    
    def get_doctor_details(self, obj):
        doctor = obj.prescription_item.prescription.doctor
        if doctor:
            return {
                'id': doctor.id,
                'first_name': doctor.first_name, 
                'last_name': doctor.last_name
            }
        return None
        
        
        
    
    def create(self, validated_data):
        user = self.context['request'].user
        if not user.is_authenticated or user.role != 'pharmacist':
            raise serializers.ValidationError("only pharmacists can dispense drugs")
        try:
            validated_data['pharmacist'] = user.pharmacistprofile
        except AttributeError:
            raise serializers.ValidationError("pharmacist profile not found for the user")
        return super().create(validated_data)