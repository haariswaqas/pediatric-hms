from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import search_icd_codes, DiagnosisViewSet, DiagnosisAttachmentViewSet, TreatmentViewSet

router = DefaultRouter()
router.register(r'diagnoses', DiagnosisViewSet, basename='diagnosis')
router.register(r'attachments', DiagnosisAttachmentViewSet, basename='diagnosis-attachment')
router.register(r'treatments', TreatmentViewSet, basename='treatment')

urlpatterns = [
    path('', include(router.urls)),
    path('icd/search/', search_icd_codes, name='icd-search'),
]
