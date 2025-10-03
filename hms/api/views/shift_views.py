from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from ..models import (Shift, DoctorShiftAssignment, NurseShiftAssignment, LabTechShiftAssignment, PharmacistShiftAssignment)
from ..serializers import (ShiftSerializer, DoctorShiftAssignmentSerializer, NurseShiftAssignmentSerializer, 
                           PharmacistShiftAssignmentSerializer, LabTechShiftAssignmentSerializer)
from ..permissions import IsAdminUser, IsMedicalProfessionalUser, IsParentUser
from .logging_views import LoggingViewSet

# ONLY THE ADMIN CAN MANAGE THE SHIFTS
class ShiftViewSet(LoggingViewSet, ModelViewSet): 
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    permission_classes = [IsAdminUser]

class DoctorShiftAssignmentViewSet(LoggingViewSet, ModelViewSet):
    queryset = DoctorShiftAssignment.objects.all()
    serializer_class = DoctorShiftAssignmentSerializer
    permission_classes = [IsAdminUser | IsMedicalProfessionalUser | IsParentUser]

class NurseShiftAssignmentViewSet(LoggingViewSet, ModelViewSet):
    queryset = NurseShiftAssignment.objects.all()
    serializer_class = NurseShiftAssignmentSerializer
    permission_classes = [IsAdminUser | IsMedicalProfessionalUser]

class PharmacistShiftAssignmentViewSet(LoggingViewSet, ModelViewSet):
    queryset = PharmacistShiftAssignment.objects.all()
    serializer_class = PharmacistShiftAssignmentSerializer
    permission_classes = [IsAdminUser | IsMedicalProfessionalUser]

class LabTechShiftAssignmentViewSet(LoggingViewSet, ModelViewSet):
    queryset = LabTechShiftAssignment.objects.all()
    serializer_class = LabTechShiftAssignmentSerializer
    permission_classes = [IsAdminUser | IsMedicalProfessionalUser]
