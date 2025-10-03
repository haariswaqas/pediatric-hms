from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views import LabTestViewSet, ReferenceRangeViewSet

router = DefaultRouter()
router.register(r'lab-tests', LabTestViewSet, basename='lab-tests')
router.register(r'reference-ranges', ReferenceRangeViewSet, basename='reference-ranges')

urlpatterns = [
    path('', include(router.urls)),
]
