from rest_framework import serializers
from ..models import (User, OTP, DoctorProfile, NurseProfile, PharmacistProfile, LabTechProfile, ParentProfile)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .profile_serializers import (DoctorProfileSerializer, NurseProfileSerializer, PharmacistProfileSerializer, LabTechProfileSerializer, ParentProfileSerializer)
from ..tasks import create_system_log_task
class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'status', 'profile']

    def get_profile(self, obj):
        if obj.role == User.DOCTOR and hasattr(obj, 'doctorprofile'):
            return DoctorProfileSerializer(obj.doctorprofile).data
        elif obj.role == User.NURSE and hasattr(obj, 'nurseprofile'):
            return NurseProfileSerializer(obj.nurseprofile).data
        elif obj.role == User.PHARMACIST and hasattr(obj, 'pharmacistprofile'):
            return PharmacistProfileSerializer(obj.pharmacistprofile).data
        elif obj.role == User.LAB_TECH and hasattr(obj, 'labtechprofile'):
            return LabTechProfileSerializer(obj.labtechprofile).data
        elif obj.role == User.PARENT and hasattr(obj, 'parentprofile'):
            return ParentProfileSerializer(obj.parentprofile).data
        return None

    def create(self, validated_data):
        # Simply create the user; profile is already created in RegisterSerializer
        return User.objects.create(**validated_data)

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if profile_data:
            if instance.role == User.DOCTOR and hasattr(instance, 'doctorprofile'):
                self._update_profile(instance.doctorprofile, profile_data)
            elif instance.role == User.NURSE and hasattr(instance, 'nurseprofile'):
                self._update_profile(instance.nurseprofile, profile_data)
            elif instance.role == User.PHARMACIST and hasattr(instance, 'pharmacistprofile'):
                self._update_profile(instance.pharmacistprofile, profile_data)
            elif instance.role == User.LAB_TECH and hasattr(instance, 'labtechprofile'):
                self._update_profile(instance.labtechprofile, profile_data)
            elif instance.role == User.PARENT and hasattr(instance, 'parentprofile'):
                self._update_profile(instance.parentprofile, profile_data)

        return instance

    def _update_profile(self, profile_instance, profile_data):
        for attr, value in profile_data.items():
            setattr(profile_instance, attr, value)
        profile_instance.save()



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=True)
    license_document = serializers.FileField(required=False)  # Optional field

    class Meta:
        model = User
        fields = [
            'email',
            'username',
            'password',
            'password2',
            'role',
            'status',
            'license_document',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "Username already taken."})
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email already in use."})
        # If role != PARENT, require a license_document
        #if attrs.get('role') != User.PARENT and not attrs.get('license_document'):
           # raise serializers.ValidationError({"license_document": "This field is required for medical professionals."})
        return attrs

    def create(self, validated_data):
        """
        Create the user record and assign the license_document
        before the user is saved for the first time, ensuring
        the post_save signal sees the file on created=True.
        """
        # Extract license_document if present
        license_doc = validated_data.pop('license_document', None)
        password = validated_data.pop('password')
        validated_data.pop('password2', None)  # No longer needed

        # 1. Instantiate the user without saving
        user = User(**validated_data)

        # 2. Assign license_document before the initial save
        if license_doc:
            user.license_document = license_doc

        # 3. Set password, then save
        user.set_password(password)
        user.save()  # post_save(created=True) now sees license_document

        # 4. Create role-specific profile if needed
        if user.role == User.DOCTOR and not hasattr(user, 'doctorprofile'):
            DoctorProfile.objects.create(user=user)
        elif user.role == User.NURSE and not hasattr(user, 'nurseprofile'):
            NurseProfile.objects.create(user=user)
        elif user.role == User.PHARMACIST and not hasattr(user, 'pharmacistprofile'):
            PharmacistProfile.objects.create(user=user)
        elif user.role == User.LAB_TECH and not hasattr(user, 'labtechprofile'):
            LabTechProfile.objects.create(user=user)
        elif user.role == User.PARENT and not hasattr(user, 'parentprofile'):
            ParentProfile.objects.create(user=user)

        return user


class OTPVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)



class LoginSerializer(TokenObtainPairSerializer): 
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['status'] = user.status
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        # Prevent login if the user's status is banned
        if user.status == User.BANNED:
            create_system_log_task.delay(
                level='WARNING',
                message=f"Login attempt blocked for banned user: {user.email}",
                user_id=user.id
            )
            raise serializers.ValidationError("This account has been banned and cannot log in.")

        # Skip checks for superusers or staff
        if not user.is_superuser and not user.is_staff:
            # 1. OTP verification
            try:
                otp = OTP.objects.get(user=user)
                if not otp.is_verified:
                    create_system_log_task.delay(
                        level='WARNING',
                        message=f"Login attempt failed: Email not verified for {user.email}",
                        user_id=user.id
                    )
                    raise serializers.ValidationError("Email not verified. Please verify your email with the OTP sent to you.")
            except OTP.DoesNotExist:
                create_system_log_task.delay(
                    level='ERROR',
                    message=f"Login attempt failed: OTP record missing for {user.email}",
                    user_id=user.id
                )
                raise serializers.ValidationError("OTP verification is required but no OTP record was found.")

           

      

        # Include additional user info in the response
        data['username'] = user.username
        data['email'] = user.email
        data['role'] = user.role
        data['status'] = user.status

        return data



