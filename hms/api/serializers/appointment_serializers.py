from rest_framework import serializers
from rest_framework.serializers import Serializer, IntegerField, ChoiceField, BooleanField, DateTimeField
from ..models import Appointment, ParentProfile, DoctorProfile, Child



class AppointmentSerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=ParentProfile.objects.all(),
        required=False,
        allow_null=True
    )
    # doctor is no longer required from client; we'll auto‑assign for doctor users
    doctor = serializers.PrimaryKeyRelatedField(
        queryset=DoctorProfile.objects.all(),
        required=False,
        allow_null=True
    )
    child = serializers.PrimaryKeyRelatedField(
        queryset=Child.objects.all(),
        required=True,
        allow_null=False
    )

    # Read‑only nested details
    parent_details = serializers.SerializerMethodField()
    doctor_details = serializers.SerializerMethodField()
    child_details = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = '__all__'

    def validate(self, attrs):
        """
        Auto‑assign parent and doctor based on request.user role.
        Ensure neither parent nor doctor is left null.
        """
        request = self.context['request']
        user = request.user
        child = attrs.get('child')

        # If parent user, assign their profile
        if user.role == 'parent' and hasattr(user, 'parentprofile'):
            attrs['parent'] = user.parentprofile

        # If doctor user, assign their profile
        if user.role == 'doctor' and hasattr(user, 'doctorprofile'):
            
            attrs['doctor'] = user.doctorprofile
            attrs['status'] = 'CONFIRMED'

        # If parent still missing, derive from child's primary guardian
        if not attrs.get('parent'):
            if child and child.primary_guardian:
                attrs['parent'] = child.primary_guardian
            else:
                raise serializers.ValidationError(
                    {"parent": "Parent could not be determined."}
                )

        # Ensure doctor is set
        if not attrs.get('doctor'):
            raise serializers.ValidationError(
                {"doctor": "Doctor must be set (either implicitly or explicitly)."}
            )

        return super().validate(attrs)

    def create(self, validated_data):
        # You can set additional fields here if needed, e.g. timestamps
        return super().create(validated_data)

    def get_parent_details(self, obj):
        if obj.parent:
            return {
                "id": obj.parent.id,
                "first_name": obj.parent.first_name,
                "last_name": obj.parent.last_name
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

    def get_child_details(self, obj):
        if obj.child:
            return {
                "id": obj.child.id,
                "first_name": obj.child.first_name,
                "last_name": obj.child.last_name,
                "primary_guardian_first_name": obj.child.primary_guardian.first_name,
                "primary_guardian_last_name": obj.child.primary_guardian.last_name,
                "age": obj.child.age
            }
        return None



class AppointmentReminderSerializer(Serializer):
    every = IntegerField(min_value=1)
    period = ChoiceField(choices=[
        ('days', 'Days'),
    ])
    enabled = BooleanField()



class DoctorAppointmentReminderSerializer(Serializer):
    hour = IntegerField(min_value=0, max_value=23)
    minute = IntegerField(min_value=0, max_value=59)
    enabled = BooleanField()