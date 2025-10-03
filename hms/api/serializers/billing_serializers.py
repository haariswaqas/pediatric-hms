from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType

from ..models import Bill, BillItem, Appointment, Prescription, LabTest
from .child_serializers import ChildSerializer  # adjust import if needed



class BillItemSerializer(serializers.ModelSerializer):
    content_type_name = serializers.SerializerMethodField()
    related_model = serializers.SerializerMethodField()
    related_object_id = serializers.IntegerField(source='object_id', read_only=True)
    
    # Add bill information
    bill_number = serializers.CharField(source='bill.bill_number', read_only=True)
    bill_date = serializers.DateTimeField(source='bill.date_created', read_only=True)
    bill_status = serializers.CharField(source='bill.status', read_only=True)
    bill_total = serializers.DecimalField(source='bill.total_amount', max_digits=10, decimal_places=2, read_only=True)
    child = serializers.SerializerMethodField()
    # Or include the entire bill object (alternative approach)
    # bill = BillSerializer(read_only=True)

    class Meta:
        model = BillItem
        fields = [
            'id',
            'description',
            'quantity',
            'unit_price',
            'amount',
            'content_type',
            'related_object_id',
            'content_type_name',
            'related_model',
            # Bill information
            'bill_number',
            'bill_date',
            'bill_status',
            'bill_total',
            
            # Patient (child) information
            'child'
        ]

    def get_content_type_name(self, obj):
        if obj.content_type:
            return obj.content_type.name.title()
        return None
    def get_child(self, obj):
        if obj.bill and obj.bill.child:
            return f"{obj.bill.child.first_name} {obj.bill.child.last_name}"
        return None
    def get_related_model(self, obj):
        if obj.linked_object:
            # Customize these per your need — here are some options:
            if isinstance(obj.linked_object, Appointment):
                doctor_first_name = obj.linked_object.doctor.first_name
                doctor_last_name = obj.linked_object.doctor.last_name
                return f"Consultation with Dr. {doctor_first_name} {doctor_last_name}"
            elif isinstance(obj.linked_object, Prescription):
                return f"Prescription for {obj.linked_object.child.first_name}"
            elif isinstance(obj.linked_object, LabTest):
                return f"Lab Test: {obj.linked_object.test_type}"
            else:
                return str(obj.linked_object)
        return None

class BillSerializer(serializers.ModelSerializer):
    child = ChildSerializer(read_only=True)
    items = BillItemSerializer(source='billitem_set', many=True, read_only=True)

    class Meta:
        model = Bill
        fields = [
            'id',
            'bill_number',
            'child',
            'created_at',
            'updated_at',
            'subtotal',
            'discount_amount',
            'total_amount',
            'amount_paid',
            'items',
        ]
