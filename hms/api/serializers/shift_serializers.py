from rest_framework.serializers import ModelSerializer, PrimaryKeyRelatedField, SerializerMethodField
from ..models import (
    Shift, DoctorProfile, DoctorShiftAssignment, NurseProfile, NurseShiftAssignment, 
    PharmacistProfile, PharmacistShiftAssignment, LabTechProfile, LabTechShiftAssignment
)

class ShiftSerializer(ModelSerializer):
    class Meta:
        model = Shift
        fields = '__all__'


class DoctorShiftAssignmentSerializer(ModelSerializer):
    doctor = PrimaryKeyRelatedField(
        queryset=DoctorProfile.objects.all(),
        required=True, 
        allow_null=False
    )
    doctor_details = SerializerMethodField()

    shifts = PrimaryKeyRelatedField(
        queryset=Shift.objects.all(),
        many=True,  # Now accepting multiple shifts
        required=True
    )
    shift_details = SerializerMethodField()

    class Meta:
        model = DoctorShiftAssignment
        fields = '__all__'

    def get_doctor_details(self, obj):
        """Returns doctor's first and last name from DoctorProfile."""
        if obj.doctor:
            return {
                "doctor_id": obj.doctor.id,
                "doctor_user_id": obj.doctor.user.id,
                "first_name": obj.doctor.first_name,  
                "last_name": obj.doctor.last_name
            }
        return None

    def get_shift_details(self, obj):
        """Returns details of all assigned shifts."""
        return [
            {
                "day": shift.day,
                "start_time": shift.start_time.strftime("%H:%M"),
                "end_time": shift.end_time.strftime("%H:%M")
            }
            for shift in obj.shifts.all()
        ]


class NurseShiftAssignmentSerializer(ModelSerializer):
    nurse = PrimaryKeyRelatedField(
        queryset=NurseProfile.objects.all(),
        required=True, 
        allow_null=False
    )
    nurse_details = SerializerMethodField()

    shifts = PrimaryKeyRelatedField(
        queryset=Shift.objects.all(),
        many=True,
        required=True
    )
    shift_details = SerializerMethodField()

    class Meta:
        model = NurseShiftAssignment
        fields = '__all__'

    def get_nurse_details(self, obj):
        if obj.nurse:
            return {
                "first_name": obj.nurse.first_name,
                "last_name": obj.nurse.last_name
            }
        return None

    def get_shift_details(self, obj):
        return [
            {
                "day": shift.day,
                "start_time": shift.start_time.strftime("%H:%M"),
                "end_time": shift.end_time.strftime("%H:%M")
            }
            for shift in obj.shifts.all()
        ]


class PharmacistShiftAssignmentSerializer(ModelSerializer):
    pharmacist = PrimaryKeyRelatedField(
        queryset=PharmacistProfile.objects.all(),
        required=True, 
        allow_null=False
    )
    pharmacist_details = SerializerMethodField()

    shifts = PrimaryKeyRelatedField(
        queryset=Shift.objects.all(),
        many=True,
        required=True
    )
    shift_details = SerializerMethodField()

    class Meta:
        model = PharmacistShiftAssignment
        fields = '__all__'

    def get_pharmacist_details(self, obj):
        if obj.pharmacist:
            return {
                "first_name": obj.pharmacist.first_name,
                "last_name": obj.pharmacist.last_name
            }
        return None

    def get_shift_details(self, obj):
        return [
            {
                "day": shift.day,
                "start_time": shift.start_time.strftime("%H:%M"),
                "end_time": shift.end_time.strftime("%H:%M")
            }
            for shift in obj.shifts.all()
        ]


class LabTechShiftAssignmentSerializer(ModelSerializer):
    lab_tech = PrimaryKeyRelatedField(
        queryset=LabTechProfile.objects.all(),
        required=True, 
        allow_null=False
    )
    lab_tech_details = SerializerMethodField()

    shifts = PrimaryKeyRelatedField(
        queryset=Shift.objects.all(),
        many=True,
        required=True
    )
    shift_details = SerializerMethodField()

    class Meta:
        model = LabTechShiftAssignment
        fields = '__all__'

    def get_lab_tech_details(self, obj):
        if obj.lab_tech:
            return {
                "first_name": obj.lab_tech.first_name,
                "last_name": obj.lab_tech.last_name
            }
        return None

    def get_shift_details(self, obj):
        return [
            {
                "day": shift.day,
                "start_time": shift.start_time.strftime("%H:%M"),
                "end_time": shift.end_time.strftime("%H:%M")
            }
            for shift in obj.shifts.all()
        ]
