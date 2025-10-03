from rest_framework import serializers

class AdmissionReportScheduleSerializer(serializers.Serializer):
    every = serializers.IntegerField(min_value=1)
    period = serializers.ChoiceField(choices=[
        ('seconds', 'Seconds'),
        ('minutes', 'Minutes'),
        ('hours', 'Hours'),
        ('days', 'Days'),
        
    ])
    enabled = serializers.BooleanField()

class VaccinationReportScheduleSerializer(serializers.Serializer):
    every = serializers.IntegerField(min_value=1)
    period = serializers.ChoiceField(choices=[
        ('seconds', 'Seconds'),
        ('minutes', 'Minutes'),
        ('hours', 'Hours'),
        ('days', 'Days'),
        
    ])
    enabled = serializers.BooleanField()

class DrugDispenseReportScheduleSerializer(serializers.Serializer):
    every = serializers.IntegerField(min_value=1)
    period = serializers.ChoiceField(choices=[
        ('seconds', 'Seconds'),
        ('minutes', 'Minutes'),
        ('hours', 'Hours'),
        ('days', 'Days'),
        
    ])
    enabled = serializers.BooleanField()