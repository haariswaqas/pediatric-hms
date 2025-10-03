from ..models import Ward, Bed
from ..serializers import WardSerializer, BedSerializer
from rest_framework.permissions import IsAuthenticated
from ..permissions import IsAdminUser, IsMedicalProfessionalUser
from rest_framework.viewsets import ModelViewSet
from .logging_views import LoggingViewSet


    
# ONLY THE ADMIN CAN MANAGE THE WARDS
class WardViewSet(LoggingViewSet, ModelViewSet): 
    queryset = Ward.objects.all()
    serializer_class = WardSerializer
    permission_classes = [IsAdminUser | IsMedicalProfessionalUser]

class BedViewSet(LoggingViewSet, ModelViewSet): 
    queryset = Bed.objects.all()
    serializer_class = BedSerializer
    permission_classes = [IsAdminUser | IsMedicalProfessionalUser]
    
    