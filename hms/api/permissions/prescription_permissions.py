from rest_framework.permissions import BasePermission, SAFE_METHODS

class PrescriptionPermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method == 'POST': 
            return hasattr(user, 'doctorprofile')
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'doctor':
            # Doctor can access only their own diagnoses
            return hasattr(obj.doctor, 'user') and obj.doctor.user == request.user

        elif request.user.role == 'parent':
            # Parent can access only prescriptions of their children
            return hasattr(request.user, 'parentprofile') and obj.child.primary_guardian == request.user.parentprofile

        return False



class PrescriptionItemPermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method == 'POST': 
            return hasattr(user, 'doctorprofile')
        return True
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'doctor':
            return hasattr(obj.prescription.doctor, 'user') and obj.prescription.doctor.user == request.user
        elif request.user.role == 'parent':
            return hasattr(request.user, 'parentprofile') and obj.prescription.child.primary_guardian == request.user.parentprofile
        return False


class IsPrescriberOrReadOnly(BasePermission):
    """
    Allows doctors to read any prescriptions or prescription items,
    but only modify those they prescribed.
    """

    def has_object_permission(self, request, view, obj):
        # Allow read-only requests for any authenticated user
        if request.method in SAFE_METHODS:
            return True

        # Check if user is a doctor
        if not hasattr(request.user, 'doctorprofile'):
            return False

        # Determine the related doctor depending on the object type
        if hasattr(obj, 'doctor'):
            # For Prescription objects
            return obj.doctor == request.user.doctorprofile
        elif hasattr(obj, 'prescription'):
            # For PrescriptionItem objects
            return obj.prescription.doctor == request.user.doctorprofile
