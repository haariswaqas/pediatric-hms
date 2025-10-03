from rest_framework.permissions import BasePermission, SAFE_METHODS
from ..models import DoctorShiftAssignment
class IsMedicalProfessionalUser(BasePermission):
    """Medical professionals (doctor, nurse, lab tech, pharmacist) can CRUD their own but view all."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['doctor', 'nurse', 'lab_tech', 'pharmacist']

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:  # Allow viewing all shift assignments
            return True
        
        # Determine the correct field dynamically
        role_field_mapping = {
            'doctor': 'doctor',
            'nurse': 'nurse',
            'lab_tech': 'lab_tech',
            'pharmacist': 'pharmacist'
        }

        role_field = role_field_mapping.get(request.user.role)
        
        if not role_field:
            return False  # User role not recognized

        # Check if the shift assignment has the correct user
        assigned_professional = getattr(obj, role_field, None)
        return assigned_professional and assigned_professional.user == request.user

class IsParentUser(BasePermission):
    """Parents can only view doctor shift assignments."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'parent'

    def has_object_permission(self, request, view, obj):
        return request.method in SAFE_METHODS and isinstance(obj, DoctorShiftAssignment)  # Can only view doctor shifts

