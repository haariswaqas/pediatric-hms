import stripe
from django.conf import settings
from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import Payment, User

stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentSerializer(serializers.ModelSerializer):
    client_secret = serializers.SerializerMethodField()
    processed_by = serializers.SerializerMethodField()
    patient_details = serializers.SerializerMethodField()
    parent_details = serializers.SerializerMethodField()
    bill_details = serializers.SerializerMethodField()
    class Meta:
        model = Payment
        fields = [
            'id', 'bill', 'stripe_payment_intent_id', 'client_secret',
            'amount', 'currency', 'method', 'status', 'reference_number',
            'notes', 'patient_details', 'parent_details', 'bill_details' ,'processed_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'status', 'created_at', 'updated_at', 'stripe_payment_intent_id', 
            'client_secret', 'processed_by'
        ]

    def __init__(self, *args, **kwargs):
        """Store the request context to access the user"""
        super().__init__(*args, **kwargs)
        self.user = None
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            self.user = request.user

    def get_patient_details(self, obj):
        patient = obj.bill.child
        if patient:
            return {
                "first_name": patient.first_name,
                "last_name": patient.last_name,
                
            }
        return None
    
    def get_parent_details(self, obj):
        parent = obj.bill.child.primary_guardian
        if parent:
            return {
                "first_name": parent.first_name,
                "last_name": parent.last_name,
                
            }
        return None
    
    def get_bill_details(self, obj):
        bill = obj.bill
        if bill:
            return {
                "bill_number": bill.bill_number,
                "total_amount": bill.total_amount,
                "amount_paid_till_now": bill.amount_paid
            }
        return None
    
    def create(self, validated_data):
        """Create payment with processed_by set to current user"""
        bill = validated_data['bill']
        amount = validated_data['amount']
        currency = validated_data.get('currency', 'usd')

        # 1) Create the Stripe PaymentIntent
        try:
            intent = Payment.create_stripe_intent(bill.id, amount, currency)
            stripe_status = intent.status
            
            # Map stripe status to internal
            status_mapping = {
                'requires_action': 'requires_action',
                'requires_source_action': 'requires_action',
                'succeeded': 'completed',
                'requires_payment_method': 'failed',
            }
            internal_status = status_mapping.get(stripe_status, 'pending')
            
        except Exception as e:
            # If Stripe fails, we can still create the payment with pending status
            # This allows for manual processing or retry later
            intent = None
            internal_status = 'pending'
            print(f"Stripe PaymentIntent creation failed: {e}")

        # 2) Persist our Payment record with processed_by
        payment_data = {
            'bill': bill,
            'amount': amount,
            'currency': currency.upper(),
            'method': validated_data.get('method', 'card'),
            'status': internal_status,
            'reference_number': validated_data.get('reference_number', ''),
            'notes': validated_data.get('notes', ''),
        }
        
        # Set processed_by to current user if authenticated
        if self.user and self.user.is_authenticated:
            payment_data['processed_by'] = self.user
            
        # Add Stripe payment intent ID if created successfully
        if intent:
            payment_data['stripe_payment_intent_id'] = intent.id

        payment = Payment.objects.create(**payment_data)
        return payment

    def update(self, instance, validated_data):
        """Update payment with processed_by updated to current user"""
        # Store original values for comparison
        original_amount = instance.amount
        original_status = instance.status
        original_method = instance.method
        
        # Update basic fields
        for field in ['amount', 'currency', 'method', 'reference_number', 'notes']:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        
        # Set processed_by to current user if making significant changes
        significant_change = (
            validated_data.get('amount') != original_amount or
            validated_data.get('method') != original_method or
            'reference_number' in validated_data or
            'notes' in validated_data
        )
        
        if significant_change and self.user and self.user.is_authenticated:
            instance.processed_by = self.user
        
        # Handle status updates - only allow certain manual status changes
        new_status = validated_data.get('status')
        if new_status and new_status != original_status:
            # Define which status changes are allowed manually
            manual_allowed_changes = {
                'pending': ['failed', 'cancelled'],
                'failed': ['pending'],
                'requires_action': ['failed', 'cancelled'],
                'completed': ['refunded'],  # Only allow refund of completed payments
            }
            
            allowed_statuses = manual_allowed_changes.get(original_status, [])
            if new_status in allowed_statuses:
                instance.status = new_status
                if self.user and self.user.is_authenticated:
                    instance.processed_by = self.user
            else:
                # For disallowed status changes, sync with Stripe instead
                if instance.stripe_payment_intent_id:
                    try:
                        instance.update_from_intent()
                    except Exception as e:
                        print(f"Failed to sync with Stripe: {e}")

        instance.save()
        return instance

    def get_client_secret(self, obj):
        """Get client secret for frontend payment processing"""
        if not obj.stripe_payment_intent_id:
            return None
            
        try:
            intent = stripe.PaymentIntent.retrieve(obj.stripe_payment_intent_id)
            return intent.client_secret
        except Exception as e:
            print(f"Error retrieving client_secret for payment {obj.id}: {e}")
            return None

    def get_processed_by(self, obj):
        """Return processed_by user information"""
        if obj.processed_by:
            return {
                'id': obj.processed_by.id,
                'username': obj.processed_by.username,
                'first_name': obj.processed_by.first_name,
                'last_name': obj.processed_by.last_name,
                'full_name': f"{obj.processed_by.first_name} {obj.processed_by.last_name}".strip()
            }
        return None

    def validate_amount(self, value):
        """Validate payment amount"""
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be greater than zero.")
        return value

    def validate(self, data):
        """Cross-field validation"""
        bill = data.get('bill')
        amount = data.get('amount')
        
        if bill and amount:
            # For new payments, check if amount exceeds bill balance
            if not self.instance:  # Creating new payment
                if amount > bill.balance_due:
                    raise serializers.ValidationError({
                        'amount': f'Payment amount (${amount}) cannot exceed remaining balance (${bill.balance_due})'
                    })
            else:  # Updating existing payment
                # Calculate what the new balance would be
                old_amount = self.instance.amount
                balance_adjustment = amount - old_amount
                if balance_adjustment > bill.balance_due:
                    raise serializers.ValidationError({
                        'amount': f'Updated payment amount would exceed bill total'
                    })
        
        # Validate currency format
        currency = data.get('currency', '').upper()
        if currency and len(currency) != 3:
            raise serializers.ValidationError({
                'currency': 'Currency must be a 3-letter ISO code (e.g., USD, EUR)'
            })
        
        return data


