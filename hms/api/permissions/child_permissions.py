from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied

class IsParentOrAdmin(BasePermission):
    """
    Custom permission to allow:
    - Admins and non-parent users to manage all children's data.
    - Parents can only manage their own children (based on primary or secondary guardian).
    """

    def has_permission(self, request, view):
        """
        Ensures the user is authenticated and checks if the user is either a parent or an admin.
        """
        # Ensure the user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admins and non-parents can manage all children
        if request.user.role in ['admin', 'doctor', 'nurse', 'pharmacist', 'lab_tech', 'parent']:
            return True
        
        # Parents can only access their own children
        return True  # The `has_object_permission` check will handle further filtering

    def has_object_permission(self, request, view, obj):
        """
        Allow parents to manage only their own children.
        Admins and medical professionals have full access to all children.
        """
        if request.user.role in ['admin', 'doctor', 'nurse', 'lab_tech']:
            return True
       
        
        # Parents can only access their own children
        return obj.primary_guardian == request.user.parentprofile or obj.secondary_guardian == request.user.parentprofile
    
class CanViewVitalsPlot(BasePermission):
    """
    Medical professionals and admins can view all children's vitals.
    Parents can only view the vitals of their own children.
    """

    def has_permission(self, request, view):
        # Must be authenticated to access
        if not request.user.is_authenticated:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Admins and medical professionals can access any child's vitals
        if user.role in ['admin', 'doctor', 'nurse', 'lab_tech', 'pharmacist']:
            return True

        # Parents can access their own children's vitals
        if user.role == 'parent':
            parent_profile = user.parentprofile
            return obj.primary_guardian == parent_profile or obj.secondary_guardian == parent_profile

        return False


