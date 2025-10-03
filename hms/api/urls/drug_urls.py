from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import DrugViewSet, DrugInteractionViewSet, DrugDispenseRecordViewSet

router = DefaultRouter()
router.register(r'drugs', DrugViewSet, basename='drugs')
router.register(r'drug-interactions', DrugInteractionViewSet, basename='drug-interaction')
router.register(r'drug-dispense', DrugDispenseRecordViewSet, basename='drug-dispense')

urlpatterns = [
    path('', include(router.urls)),
]
