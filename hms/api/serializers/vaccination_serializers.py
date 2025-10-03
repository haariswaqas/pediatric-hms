from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, Serializer, IntegerField, ChoiceField, BooleanField, SerializerMethodField, PrimaryKeyRelatedField
from ..models import Vaccine, Child, VaccinationRecord


class VaccineSerializer(ModelSerializer):
    class Meta:
        model = Vaccine
        fields = '__all__'
        
        
   
  
class VaccinationRecordSerializer(ModelSerializer):
    child = serializers.PrimaryKeyRelatedField(
        queryset=Child.objects.all(),
        required=True
    )

    child_details = SerializerMethodField()
    administered_by_details = SerializerMethodField()


    vaccine = PrimaryKeyRelatedField(
        queryset=Vaccine.objects.all(), 
        required=True
    )

    vaccine_details = SerializerMethodField()

    class Meta:
        model = VaccinationRecord
        fields = '__all__' 
        extra_kwargs = {'administered_by': {'read_only': True}}  # Prevent users from manually setting it

    def get_child_details(self, obj):
        if obj.child:
            return {
                "id": obj.child.id,
                "first_name": obj.child.first_name,
                "last_name": obj.child.last_name
            }
        return None

    def get_vaccine_details(self, obj):
        if obj.vaccine:
            return {
                "name": obj.vaccine.name,
                "description": obj.vaccine.description,
                "is_active": obj.vaccine.is_active
            }
        return None

    def get_administered_by_details(self, obj):
        user = obj.administered_by
        
        if not user:
            return None

        profile_data = {
            
        }

        if user.role == 'doctor' and hasattr(user, 'doctorprofile'):
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
            validated_data['administered_by'] = request.user  # Set the currently logged-in user
        return super().create(validated_data)

    
    def update(self, instance, validated_data):
        """
        When a vaccination record is updated, overwrite `administered_by` with the currently logged-in user.
        """
        request = self.context.get('request')
        if request and request.user:
            instance.administered_by = request.user  # Overwrite the user
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


# View to handle setting vaccination reminders

#vaccination_reminder_serializers.py

class ParentVaccinationReminderSerializer(Serializer):
    every = IntegerField(min_value=1)
    period = ChoiceField(choices= [
        ('days', 'Days'),
    ])
    enabled = BooleanField()
    

class MedicalProfessionalVaccinationReminderSerializer(Serializer):
    every = IntegerField(min_value=1)
    period = ChoiceField(choices= [
        ('days', 'Days'),
    ])
    enabled = BooleanField()