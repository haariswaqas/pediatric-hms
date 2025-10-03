from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import (AdminUserViewSet, AdminDoctorProfileViewSet, AdminNurseProfileViewSet, AdminPharmacistProfileViewSet, 
                       AdminParentProfileViewSet, AdminLabTechProfileViewSet, UserSearchView, RolePermissionViewSet, ContentTypesView)


router = DefaultRouter()
router_path = router.register 
# allows admin to manage users
router_path(r'admin/users', AdminUserViewSet, basename='admin-users')

# allows admin to manage profiles of the users
router_path(r'admin/doctor-profiles', AdminDoctorProfileViewSet, basename='admin-doctor-profiles')
router_path(r'admin/nurse-profiles', AdminNurseProfileViewSet, basename='admin-nurse-profiles')
router_path(r'admin/pharmacist-profiles', AdminPharmacistProfileViewSet, basename='admin-pharmacist-profiles')
router_path(r'admin/parent-profiles', AdminParentProfileViewSet, basename='admin-parent-profiles')
router_path(r'admin/labtech-profiles', AdminLabTechProfileViewSet, basename='admin-labtech-profiles')
router_path(r'admin/role-permissions', RolePermissionViewSet, basename='admin-role-permissions')

urlpatterns = [
    path('', include(router.urls)),  # Missing closing bracket and comma here
    path("search/users/", UserSearchView.as_view(), name="user-search"),
    path('admin/view-models/', ContentTypesView.as_view(), name='view-models')
]