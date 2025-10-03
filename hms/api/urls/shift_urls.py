from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views import (
    ShiftViewSet,
    DoctorShiftAssignmentViewSet,
    NurseShiftAssignmentViewSet,
    PharmacistShiftAssignmentViewSet,
    LabTechShiftAssignmentViewSet
)

# Create a router and register the viewsets
router = DefaultRouter()
router.register(r'shifts', ShiftViewSet, basename='shift')
router.register(r'doctor-shift-assignments', DoctorShiftAssignmentViewSet, basename='doctor-shift-assignment')
router.register(r'nurse-shift-assignments', NurseShiftAssignmentViewSet, basename='nurse-shift-assignment')
router.register(r'pharmacist-shift-assignments', PharmacistShiftAssignmentViewSet, basename='pharmacist-shift-assignment')
router.register(r'labtech-shift-assignments', LabTechShiftAssignmentViewSet, basename='labtech-shift-assignment')

# Include the router-generated URLs
urlpatterns = [
    path('', include(router.urls)),
]
