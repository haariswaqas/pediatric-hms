from django.urls import path
from api.views import (DoctorProfileView, NurseProfileView,
    PharmacistProfileView, LabTechProfileView, ParentProfileView,
    DoctorProfileSearchView,
    NurseProfileSearchView,
    PharmacistProfileSearchView,
    LabTechProfileSearchView,)

urlpatterns = [
    path('doctor/profile/', DoctorProfileView.as_view(), name='doctor-profile'),
    path('nurse/profile/', NurseProfileView.as_view(), name='nurse-profile'),
    path('pharmacist/profile/', PharmacistProfileView.as_view(), name='pharmacist-profile'),
    path('parent/profile/', ParentProfileView.as_view(), name='parent-profile'),
    path('lab_tech/profile/', LabTechProfileView.as_view(), name='labtech-profile'), 
    
    path("search/doctors/", DoctorProfileSearchView.as_view(), name="doctor-search"),
    path("search/nurses/", NurseProfileSearchView.as_view(), name="nurse-search"),
    path("search/pharmacists/", PharmacistProfileSearchView.as_view(), name="pharmacist-search"),
    path("search/labtechs/", LabTechProfileSearchView.as_view(), name="labtech-search"),
    

]
