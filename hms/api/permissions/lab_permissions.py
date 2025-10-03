from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied

class IsLabTechOrReadOnly(BasePermission):
    """
    Only lab_tech users can create, update, or delete. Others can only read.
    """

    def has_permission(self, request, view):
        # Everyone authenticated can view
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated

        # Only allow full access to pharmacists
        return request.user.is_authenticated and request.user.role == 'lab_tech'

    def has_object_permission(self, request, view, obj):
        # Safe methods (GET, HEAD, OPTIONS) are always allowed
        if request.method in SAFE_METHODS:
            return True

        # Write permissions only for pharmacists
        return request.user.role == 'lab_tech'
    

class LabRequestPermission(BasePermission):  
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method == 'POST': 
            return hasattr(user, 'doctorprofile')
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.role in ['admin', 'lab_tech']:
            return True

        if user.role == 'doctor':
            return obj.requested_by and obj.requested_by.user == user

        elif user.role == 'parent':
            parent_profile = getattr(user, 'parentprofile', None)
            is_guardian = parent_profile and (
                obj.child.primary_guardian == parent_profile or obj.child.secondary_guardian == parent_profile
            )
            # Allow only safe (read-only) methods for parents
            return is_guardian and request.method in SAFE_METHODS

        return False


class LabRequestItemPermission(BasePermission):  
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method == 'POST': 
            return hasattr(user, 'doctorprofile')
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.role in ['admin', 'lab_tech']:
            # Admins and lab techs have full access
            return True

        if user.role == 'doctor':
            # Doctor can only access or modify their own lab requests
            return obj.lab_request.requested_by and obj.lab_request.requested_by.user == user

        elif user.role == 'parent':
            # Parents can only view (not update/delete) test items for their children
            parent_profile = getattr(user, 'parentprofile', None)
            child = obj.lab_request.child
            is_guardian = parent_profile and (
                child.primary_guardian == parent_profile or child.secondary_guardian == parent_profile
            )
            return is_guardian and request.method in SAFE_METHODS

        return False
class LabResultPermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method == 'POST': 
            return hasattr(user, 'labtechprofile')
        return True
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == 'admin':
            return True
        # lab technician can only modify the lab result instances he/she performed
        if user.role == 'lab_tech':
            return obj.performed_by and obj.performed_by.user == user
        elif user.role == 'parent':
            parent_profile = getattr(user, 'parentprofile', None)
            child = obj.lab_request_item.lab_request.child
            is_guardian = parent_profile and (
                child.primary_guardian == parent_profile or child.secondary_guardian == parent_profile
            )
            return is_guardian and request.method in SAFE_METHODS
        else:
            raise PermissionDenied("you do not have permission to modify the lab result object")
    

class LabResultParameterPermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method == 'POST': 
            return hasattr(user, 'labtechprofile')
        return True
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == 'admin':
            return True
        # lab technician can only modify the lab result instances he/she performed
        if user.role == 'lab_tech':
            return obj.lab_result.performed_by and obj.lab_result.performed_by.user == user
        elif user.role == 'parent':
            parent_profile = getattr(user, 'parentprofile', None)
            child = obj.lab_result.lab_request_item.lab_request.child
            is_guardian = parent_profile and (
                child.primary_guardian == parent_profile or child.secondary_guardian == parent_profile
            )
            return is_guardian and request.method in SAFE_METHODS
