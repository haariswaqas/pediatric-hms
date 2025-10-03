from django.db import models
from django.contrib.contenttypes.models import ContentType

class RolePermissionModel(models.Model):
    
    ADMIN = 'admin'
    DOCTOR = 'doctor'
    NURSE = 'nurse'
    PHARMACIST = 'pharmacist'
    PARENT = 'parent'
    LAB_TECH = 'lab_tech'
    
    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (DOCTOR, 'Doctor'),
        (NURSE, 'Nurse'),
        (PHARMACIST, 'Pharmacist'),
        (PARENT, 'Parent'),
        (LAB_TECH, 'Lab_Tech')
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    can_create = models.BooleanField(default=False)
    can_read = models.BooleanField(default=True)
    can_update = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)

    class Meta:
        unique_together = ('role', 'content_type')
        
def has_dynamic_permission(user, content_type, method):
    role = user.role
    method = method.upper()
    try:
        permission = RolePermissionModel.objects.get(role=role, content_type=content_type)
        if method == "GET":
            return permission.can_read
        elif method == "POST":
            return permission.can_create
        elif method in ["PUT", "PATCH"]:
            return permission.can_update
        elif method == "DELETE":
            return permission.can_delete
    except RolePermissionModel.DoesNotExist:
        return False