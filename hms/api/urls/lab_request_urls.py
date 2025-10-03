from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views import LabRequestViewSet, LabRequestItemViewSet

router = DefaultRouter()
router.register(r'lab-requests', LabRequestViewSet, basename='lab-requests')
router.register(r'lab-request-items', LabRequestItemViewSet, basename='lab-request-items')

urlpatterns = [
    path('', include(router.urls)),
]
