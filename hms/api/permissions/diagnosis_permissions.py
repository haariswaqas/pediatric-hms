from rest_framework.permissions import BasePermission, SAFE_METHODS

class DiagnosisPermission(BasePermission):
    """
    Doctors can only access diagnoses they created.
    Parents can view diagnoses of their children.
    """

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
            # Parent can access only diagnoses of their children
            return hasattr(request.user, 'parentprofile') and obj.child.primary_guardian == request.user.parentprofile

        return False



class DiagnosisPermissions(BasePermission):
    """
    Doctors may read any Diagnosis (GET, HEAD, OPTIONS),
    but may only update or delete those they created.
    """

    def has_permission(self, request, view):
        # only authenticated users get in at all
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            if request.user.role == 'doctor':
                return True
            elif request.user.role == 'parent':
                return hasattr(request.user, 'parentprofile') and obj.child.primary_guardian == request.user.parentprofile
            return False

        # Only the doctor who made it can update/delete
        return (
            request.user.role == 'doctor'
            and hasattr(obj.doctor, 'user')
            and obj.doctor.user == request.user
        )



class IsDoctorOrLabTechOtherwiseReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role in ['doctor', 'lab_tech']
    
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return request.user.role == 'doctor' or request.user.role == 'lab_tech'

