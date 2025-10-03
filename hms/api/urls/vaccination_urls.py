from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views import VaccineViewSet, VaccinationRecordViewSet

# Create a router and register the VaccinationRecordViewSet
router = DefaultRouter()
router.register(r'vaccination-records', VaccinationRecordViewSet, basename='vaccinationrecord')
router.register(r'vaccines', VaccineViewSet, basename='vaccine')

urlpatterns = [
    path('', include(router.urls)),
]
