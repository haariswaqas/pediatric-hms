from rest_framework import serializers
from ..models import DoctorProfile, NurseProfile, Shift, Ward, Bed
from .profile_serializers import DoctorProfileSerializer

        

class WardSerializer(serializers.ModelSerializer):
  

    class Meta:
        model = Ward
        fields = '__all__'

        

class BedSerializer(serializers.ModelSerializer):
    ward_name = serializers.CharField(source='ward.name', read_only=True)
    ward_details = WardSerializer(source='ward', read_only=True)
    
    
    class Meta:
        model = Bed
        fields = '__all__'

