from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import AppointmentViewSet

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointments')


urlpatterns = [
    path('', include(router.urls))
]
