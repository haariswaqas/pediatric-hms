from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import (BillViewSet, BillItemViewSet, BillGenerationViewSet, PaymentViewSet)
from api.views.utils.webhook import stripe_webhook
router = DefaultRouter()


router.register(r'bills', BillViewSet, basename='bill-viewset')
router.register(r'bill-items', BillItemViewSet, basename='bill-items-viewset')

router.register(r'generate-bill', BillGenerationViewSet, basename="generate-bill")

router.register(r'payments', PaymentViewSet)

urlpatterns = [
     path('', include(router.urls)), 
     
    path('stripe/webhook/', stripe_webhook, name='stripe-webhook'),
]


