from rest_framework import serializers
from ..models import (DoctorProfile, NurseProfile, PharmacistProfile, LabTechProfile, ParentProfile)

class DoctorProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(max_length=None, use_url=True, required=False, allow_null=True)

    class Meta:
        model = DoctorProfile
        fields = '__all__'
        read_only_fields = ('user',)



class NurseProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(max_length=None, use_url=True, required=False, allow_null=True)

    class Meta:
        model = NurseProfile
        fields = '__all__'
        read_only_fields = ('user',)

    


class PharmacistProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(max_length=None, use_url=True, required=False, allow_null=True)

    class Meta:
        model = PharmacistProfile
        fields = '__all__'
        read_only_fields = ('user',)
        

class LabTechProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(max_length=None, use_url=True, required=False, allow_null=True)

    class Meta:
        model = LabTechProfile
        fields = '__all__'
        read_only_fields = ('user',)



class ParentProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(max_length=None, use_url=True, required=False, allow_null=True)

    class Meta:
        model = ParentProfile
        fields = '__all__'
        read_only_fields = ('user',)

