from rest_framework.permissions import BasePermission, SAFE_METHODS

class VaccinationRecordPermission(BasePermission):
    """
    Parents (Guardians) can only view their child's vaccination records.
    Admins and Medical Professionals have full CRUD access.
    """

    def has_permission(self, request, view):
        if request.user.is_authenticated:
            # Admins and medical professionals have full access
            if request.user.role in ['admin', 'doctor', 'nurse', 'pharmacist', 'lab_tech']:
                return True
            # Parents can only view records, not modify
            if request.user.role == 'parent' and request.method in SAFE_METHODS:
                return True
        return False  # Deny access if none of the conditions match

    def has_object_permission(self, request, view, obj):
        # Admins and medical professionals can fully access the record
        if request.user.role in ['admin', 'doctor', 'nurse']:
            return True
        
        # Parents can only view their own child's records
        if request.user.role == 'parent' and request.method in SAFE_METHODS:
            return obj.child.primary_guardian == request.user.parentprofile or obj.child.secondary_guardian == request.user.parentprofile
        
        return False  # Deny access for other cases
