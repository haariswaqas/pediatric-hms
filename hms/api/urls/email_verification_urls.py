from django.urls import path
from api.views import VerifyMedicalProfessionalView

urlpatterns = [
     path('verify-medical-professional/<int:user_id>/<str:token>/', VerifyMedicalProfessionalView.as_view(), name='verify-medical-professional')
]
