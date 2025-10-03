from rest_framework.permissions import BasePermission, SAFE_METHODS

class AdmissionRecordPermission(BasePermission):
    """
    - Admins and medical professionals (doctor, nurse, pharmacist, lab_tech)
      have full CRUD on all admission records.
    - A child's primary or secondary guardian can full CRUD on that child’s records.
    - Other authenticated users (including parents of other children) are denied.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Admins and medical staff can do anything
        if user.role in ['admin', 'doctor', 'nurse', 'pharmacist', 'lab_tech']:
            return True

        # Parents can access the view layer (detailed checks in has_object_permission)
        if user.role == 'parent':
            return True

        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        

        # Admins and medical staff: full CRUD
        if user.role in ['admin', 'doctor', 'nurse', 'pharmacist', 'lab_tech']:
            return True

        # Parents (primary or secondary) get full CRUD on their own child's records
        if user.role == 'parent':
            return hasattr(request.user, 'parentprofile') and obj.child.primary_guardian == request.user.parentprofile
        return False

class AdmissionVitalRecordPermission(BasePermission):
    """
    Parents (Guardians) can only view their child's admission vital records.
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
    # Allow full access for admins and medical professionals
        if request.user.role in ['admin', 'doctor', 'nurse', 'pharmacist', 'lab_tech']:
            return True
        # Parents can only view records for their own child's admission vitals
        if request.user.role == 'parent' and request.method in SAFE_METHODS:
            # Note: Here we access the child through the admission field
            return obj.admission.child.primary_guardian == request.user.parentprofile or \
                obj.admission.child.secondary_guardian == request.user.parentprofile
        return False
