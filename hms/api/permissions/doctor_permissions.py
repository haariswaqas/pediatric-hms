from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsDoctorOrReadOnly(BasePermission):
    """
    Only doctors can create, update, or delete. Others can only read.
    """

    def has_permission(self, request, view):
        # Everyone authenticated can view
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated

        # Only allow full access to doctors
        return request.user.is_authenticated and request.user.role == 'doctor'

    def has_object_permission(self, request, view, obj):
        # Safe methods (GET, HEAD, OPTIONS) are always allowed
        if request.method in SAFE_METHODS:
            return True

        # Write permissions only for doctors
        return request.user.role == 'doctor'
