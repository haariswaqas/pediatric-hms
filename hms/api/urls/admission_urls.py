from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views import AdmissionRecordViewSet, AdmissionVitalRecordViewSet, AdmissionVitalRecordHistoryViewSet


router = DefaultRouter()
router.register(r'admission-records', AdmissionRecordViewSet, basename='admissionrecord')
router.register(r'admission-vital-records', AdmissionVitalRecordViewSet, basename='admissionvitalrecords')
router.register(r'admission-vital-history', AdmissionVitalRecordHistoryViewSet, basename='admission-vital-history')

urlpatterns = [
    path('', include(router.urls)),
]
