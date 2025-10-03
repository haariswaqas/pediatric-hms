from rest_framework.permissions import BasePermission, SAFE_METHODS

class BillPermission(BasePermission):
    def has_permission(self, request, view):
        # Only authenticated users can access any endpoint
        if not request.user.is_authenticated:
            return False
        
        # SAFE_METHODS (GET, HEAD, OPTIONS)
        if request.method in SAFE_METHODS:
            return True
        
        # Only admins can perform unsafe methods (POST, PUT, PATCH, DELETE)
        return request.user.role == 'admin'

    def has_object_permission(self, request, view, obj):
        # SAFE_METHODS: Parents can only view bills of their children
        if request.method in SAFE_METHODS:
            if request.user.role == 'admin':
                return True
            elif request.user.role == 'parent':
                return (
                    hasattr(request.user, 'parentprofile') and 
                    obj.child.primary_guardian == request.user.parentprofile
                )
            return False
        
        # For unsafe methods, only admin is allowed (already checked in has_permission)
        return request.user.role == 'admin'


class PaymentPermission(BasePermission):
    def has_permission(self, request, view):
        # Everyone must be authenticated
        if not request.user.is_authenticated:
            return False

        # Admins can only view
        if request.user.role == 'admin':
            return request.method in SAFE_METHODS

        # Parents can only write (POST) and read (GET) their own children's payments
        if request.user.role == 'parent':
            return request.method in SAFE_METHODS or request.method == 'POST'

        # Other roles not allowed
        return False

    def has_object_permission(self, request, view, obj):
        # Admins can only view any payment
        if request.user.role == 'admin':
            return request.method in SAFE_METHODS

        # Parents can only view or create payments for their children
        if request.user.role == 'parent':
            if not hasattr(request.user, 'parentprofile'):
                return False
            
            is_childs_payment = obj.bill.child.primary_guardian == request.user.parentprofile
            return request.method in SAFE_METHODS or (request.method == 'POST' and is_childs_payment)

        return False