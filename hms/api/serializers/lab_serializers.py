from rest_framework import serializers
from ..models import LabTest, ReferenceRange

class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = '__all__'

class ReferenceRangeSerializer(serializers.ModelSerializer):
    lab_test = serializers.SlugRelatedField(queryset=LabTest.objects.all(), slug_field='code')
    lab_test_details = serializers.SerializerMethodField()

    class Meta:
        model = ReferenceRange
        fields = [
            'id',
            'lab_test',
            'lab_test_details',
            'parameter_name',  
            'min_age_months',
            'max_age_months',
            'gender',
            'min_value',
            'max_value',
            'unit',
            'textual_reference',
            'notes'
        ]

    def get_lab_test_details(self, obj):
        if obj.lab_test:
            return {
                "id": obj.lab_test.id,
                "name": {obj.lab_test.name},
                "code": {obj.lab_test.code},
                "lab_test": f"{obj.lab_test.name} ({obj.lab_test.code})",
                "category": obj.lab_test.category
            }
        return None
