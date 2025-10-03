from rest_framework import serializers

from ..models import RolePermissionModel

class RolePermissionSerializer(serializers.ModelSerializer):
    # Add human-readable fields
    content_type_name = serializers.SerializerMethodField()
    content_type_model = serializers.SerializerMethodField()
    app_label = serializers.SerializerMethodField()
    
    class Meta:
        model = RolePermissionModel
        fields = [
            'id',
            'role', 
            'content_type',
            'can_read', 'can_create', 'can_update', 'can_delete',
            'content_type_name',
            'content_type_model', 
            'app_label',
            
            
            ]
            
        

    def get_content_type_name(self, obj):
        if obj.content_type:
            name = obj.content_type.name.title()
            return name if name.endswith('s') else f"{name}s"
        return None


    def get_content_type_model(self, obj):
        return obj.content_type.model if obj.content_type else None

    def get_app_label(self, obj):
        return obj.content_type.app_label if obj.content_type else None