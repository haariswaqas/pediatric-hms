# billing/views.py
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import PermissionDenied
from django.conf import settings
from decimal import Decimal
import stripe

from ..models import Payment, Bill
from ..serializers import PaymentSerializer
from ..permissions import PaymentPermission
from .logging_views import LoggingViewSet

stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentViewSet(LoggingViewSet, ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [PaymentPermission]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'admin':
            return Payment.objects.all()

        if user.role == 'parent' and hasattr(user, 'parentprofile'):
            return Payment.objects.filter(
                bill__child__primary_guardian=user.parentprofile
            )

        return Payment.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        bill = serializer.validated_data['bill']

        # Restrict parents to only pay for their own children
        if user.role == 'parent':
            if (
                not hasattr(user, 'parentprofile')
                or bill.child.primary_guardian != user.parentprofile
            ):
                raise PermissionDenied(
                    "You can only make payments on your own child's bills."
                )

        serializer.save()

    @action(detail=False, methods=['post'], url_path='create_intent')
    def create_intent(self, request):
        bill_id = request.data.get('bill')

        if not bill_id:
            return Response(
                {'detail': 'Bill ID is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            bill = Bill.objects.get(id=bill_id)
        except Bill.DoesNotExist:
            return Response(
                {'detail': 'Invalid bill ID.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Permission check for parents
        user = request.user
        if user.role == 'parent':
            if (
                not hasattr(user, 'parentprofile')
                or bill.child.primary_guardian != user.parentprofile
            ):
                raise PermissionDenied(
                    "You can only pay bills for your own child."
                )

        # Calculate unpaid amount
        unpaid_amount = bill.total_amount - bill.amount_paid
        if unpaid_amount <= 0:
            return Response(
                {'detail': 'This bill has already been paid.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create Stripe PaymentIntent
        intent = Payment.create_stripe_intent(
            bill_id=bill.id,
            amount=unpaid_amount,
            currency='usd',
        )

        # Save the payment in the DB
        payment = Payment.objects.create(
            bill=bill,
            stripe_payment_intent_id=intent.id,
            amount=Decimal(unpaid_amount),
            currency=intent.currency.upper(),
            method='card',
            status="pending",  # Always pending at creation
            processed_by=request.user,
        )

        # Return both the payment (serialized) and the client_secret
        data = self.get_serializer(payment).data
        data['client_secret'] = intent.client_secret
        return Response(data, status=status.HTTP_201_CREATED)
