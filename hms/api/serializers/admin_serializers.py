from rest_framework import serializers
from ..models import User


class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    license_document = serializers.FileField(required=False)  # Optional for all roles

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'password2', 'role', 'status', 'license_document', 'created_by_admin']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        # Pop fields we handle separately
        license_doc = validated_data.pop('license_document', None)
        validated_data.pop('password2', None)
        password = validated_data.pop('password')

        # Create the user
        user = User(**validated_data)
        user.set_password(password)
        if license_doc:
            user.license_document = license_doc
        user.save()
        return user

    def update(self, instance, validated_data):
        # Pop license_document, password2, and password if present
        license_doc = validated_data.pop('license_document', None)
        validated_data.pop('password2', None)
        password = validated_data.pop('password', None)

        # Update non-password fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Handle license_document if provided
        if license_doc:
            instance.license_document = license_doc

        # If a new password is provided, hash it
        if password:
            instance.set_password(password)

        instance.save()
        return instance


# this serializer is to allow searching foor users. UserSerializer has some restrictions which prevents searching
# hence this one was created. 
class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role",  "status", "created_by_admin"]  # Include `id` for reference