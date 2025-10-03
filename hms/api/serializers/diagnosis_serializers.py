from ..models import Diagnosis, DiagnosisAttachment, Treatment
from rest_framework import serializers

class DiagnosisAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_details = serializers.SerializerMethodField()
    
    class Meta:
        model = DiagnosisAttachment
        fields = '__all__'
        
    
    def get_uploaded_by_details(self, obj):
        user = obj.uploaded_by
        if user:
            return {
                'username': user.username,
                'email': user.email,
                'role': user.role,
            }
        return None
    
    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)

class TreatmentSerializer(serializers.ModelSerializer):
    
    
    class Meta:
        model = Treatment
        fields = '__all__'
    


class DiagnosisSerializer(serializers.ModelSerializer):
    child_details = serializers.SerializerMethodField()
    doctor_details = serializers.SerializerMethodField()
    attachments = DiagnosisAttachmentSerializer(many=True, read_only=True)
    treatments = TreatmentSerializer(many=True, read_only=True)
    related_diagnoses = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True
    )

    class Meta:
        model = Diagnosis
        fields = [
            'id', 'appointment', 'child', 'child_details',
            'doctor', 'doctor_details', 'category', 'icd_code', 'title', 'description',
            'status', 'severity', 'onset_date', 'date_diagnosed', 'resolution_date',
            'is_chronic', 'is_congenital', 'clinical_findings', 'notes',
            'related_diagnoses', 'attachments', 'treatments'
        ]
        read_only_fields = ['id', 'date_diagnosed', 'attachments', 'treatments', 'related_diagnoses', 'doctor']

    def get_child_details(self, obj):
        child = obj.child
        if child:
            return {
                'id': child.id,
                'first_name': child.first_name,
                'last_name': child.last_name,
                'date_of_birth': child.date_of_birth,
                'age': child.age
            }
        return None

    def get_doctor_details(self, obj):
        doctor = obj.doctor
        if doctor:
            user = doctor.user
            return {
                'id': doctor.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'specialization': doctor.specialization,
            }
        return None

    def create(self, validated_data):
        user = self.context['request'].user

        if not user.is_authenticated or user.role != 'doctor':
            raise serializers.ValidationError("Only doctors can create diagnoses.")

        # Assuming you have a OneToOne relation: user.doctorprofile
        try:
            validated_data['doctor'] = user.doctorprofile
        except AttributeError:
            raise serializers.ValidationError("Doctor profile not found for this user.")

        return super().create(validated_data)

    def to_representation(self, instance):
        user = self.context['request'].user

        # If user is a parent, ensure they only see diagnoses for their children
        if user.role == 'parent':
            parent_profile = getattr(user, 'parentprofile', None)
            if not parent_profile or instance.child.primary_guardian != parent_profile:
                raise serializers.ValidationError("You do not have permission to view this diagnosis.")

        return super().to_representation(instance)
