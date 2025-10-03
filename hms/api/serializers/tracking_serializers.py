from rest_framework import serializers
from ..models import GrowthRecord


class GrowthRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for GrowthRecord model to return child's growth history.
    """

    class Meta:
        model = GrowthRecord
        fields = ['child','date_recorded', 'weight', 'height', 'bmi', 'bmi_interpretation']
