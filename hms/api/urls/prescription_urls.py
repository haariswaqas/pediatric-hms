from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import PrescriptionViewSet, PrescriptionItemViewSet

router = DefaultRouter()
router.register(r'prescriptions', PrescriptionViewSet, basename='prescriptions')
router.register(r'prescription-items', PrescriptionItemViewSet, basename='prescription-items')

urlpatterns = [
    path('', include(router.urls)),
]
