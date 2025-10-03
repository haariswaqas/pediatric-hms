from rest_framework import serializers
from ..models import SystemLog

class SystemLogSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = SystemLog
        fields = ['id', 'user', 'level', 'message', 'timestamp']
