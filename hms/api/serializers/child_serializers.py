from rest_framework import serializers
from ..models import Child, ParentProfile, GrowthRecord
from django.core.validators import FileExtensionValidator
class GrowthRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrowthRecord
        fields = ['date_recorded', 'weight', 'height']

class ChildSerializer(serializers.ModelSerializer):
    """
    Serializer for Child model to handle creation, retrieval, and updates.
    Automatically calculates BMI and provides growth history.
    """
    primary_guardian = serializers.PrimaryKeyRelatedField(
        queryset=ParentProfile.objects.all(),
        required=False,
        allow_null=True
    )
    secondary_guardian = serializers.PrimaryKeyRelatedField(
        queryset=ParentProfile.objects.all(),
        required=False,
        allow_null=True
    )
    guardian_details = serializers.SerializerMethodField()
    secondary_guardian_details = serializers.SerializerMethodField()

    profile_picture = serializers.ImageField(
        max_length=None, use_url=True, required=False, allow_null=True
    )
    growth_history = serializers.SerializerMethodField()

    class Meta:
        model = Child
        fields = [
            'id',

            # Guardian info
            'primary_guardian', 'guardian_details',
            'secondary_guardian', 'secondary_guardian_details',
            'relationship_to_primary_guardian', 'relationship_to_secondary_guardian',

            # Basic child info
            'first_name', 'middle_name', 'last_name', 'profile_picture',
            'date_of_birth', 'age', 'gender', 'email',

            # Vitals & Basic Medical
            'blood_group', 'birth_weight', 'birth_height',
            'current_weight', 'current_height', 'current_bmi', 'current_bmi_interpretation',
            'allergies', 'current_medications', 'vaccination_status',

            # School & Emergency
            'school', 'grade', 'teacher_name', 'school_phone',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',

            # Insurance
            'insurance_provider', 'insurance_id',

            # Detailed Medical
            'chronic_conditions', 'medical_history', 'surgical_history',
            'family_medical_history', 'developmental_notes', 'special_needs',

            # Growth
            'growth_history'
        ]
        read_only_fields = (
            'age', 'current_bmi', 'current_bmi_interpretation', 'growth_history'
        )

    def get_guardian_details(self, obj):
        if obj.primary_guardian:
            return {
                "id": obj.primary_guardian.id,
                "first_name": obj.primary_guardian.first_name,
                "last_name": obj.primary_guardian.last_name
            }
        return None

    def get_secondary_guardian_details(self, obj):
        if obj.secondary_guardian:
            return {
                "id": obj.secondary_guardian.id,
                "first_name": obj.secondary_guardian.first_name,
                "last_name": obj.secondary_guardian.last_name
            }
        return None

    def get_growth_history(self, obj):
        if hasattr(obj, 'growth_records'):
            records = obj.growth_records.all().order_by('-date_recorded')
            return GrowthRecordSerializer(records, many=True).data
        return []

class ChildSearchSerializer(serializers.Serializer):
  
    first_name = serializers.CharField()
    middle_name = serializers.CharField(allow_null=True, required=False)
    last_name = serializers.CharField()
    gender = serializers.CharField()
    blood_group = serializers.CharField()
    date_of_birth = serializers.DateField()
    age = serializers.IntegerField()
    primary_guardian_name = serializers.CharField(allow_null=True, required=False)
    secondary_guardian_name = serializers.CharField(allow_null=True, required=False)
    


class ChildBulkUploadSerializer(serializers.Serializer):
    file = serializers.FileField(
        validators=[
            FileExtensionValidator(allowed_extensions=['xlsx', 'xls', 'csv'])
        ]
    )
    
    def validate_file(self, value):
        if value.size > 10 * 1024 * 1024:  # 10MB limit
            raise serializers.ValidationError("File size cannot exceed 10MB")
        return value