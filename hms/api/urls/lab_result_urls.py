from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views import LabResultViewSet, LabResultParameterViewSet

router = DefaultRouter()
router.register(r'lab-results', LabResultViewSet, basename='lab-results')
router.register(r'lab-result-parameters', LabResultParameterViewSet, basename='lab-result-parameters')


urlpatterns = [
    path('', include(router.urls)),
]
