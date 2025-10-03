from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import ChildViewSet, ChildMedicalHistoryPDFView

router = DefaultRouter()
router.register(r'children', ChildViewSet, basename='child')

urlpatterns = [
    path('', include(router.urls)),
    path("children/<int:child_id>/medical-history-pdf/", ChildMedicalHistoryPDFView.as_view(), name="child-medical-history-pdf"),
]
