from rest_framework.permissions import BasePermission, SAFE_METHODS
from ..models import RolePermissionModel
from django.contrib.contenttypes.models import ContentType

class DynamicRolePermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False

        model = getattr(view.queryset, 'model', None)
        if not model:
            return False

        try:
            content_type = ContentType.objects.get_for_model(model)
            role_permission = RolePermissionModel.objects.get(role=user.role, content_type=content_type)
        except RolePermissionModel.DoesNotExist:
            return False

        if request.method in SAFE_METHODS:
            return role_permission.can_read
        if request.method == 'POST':
            return role_permission.can_create
        if request.method in ['PUT', 'PATCH']:
            return role_permission.can_update
        if request.method == 'DELETE':
            return role_permission.can_delete

        return False


class IsRoleUser(BasePermission):
    """
    Allows access only to users matching the role defined on the view.
    """
    def has_permission(self, request, view):
        required_role = getattr(view, 'role', None)
        return request.user.role == required_role

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
