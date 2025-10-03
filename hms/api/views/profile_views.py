from rest_framework.generics import GenericAPIView
from rest_framework.mixins import RetrieveModelMixin, CreateModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from django_elasticsearch_dsl.search import Search
from rest_framework.views import APIView



from ..models import DoctorProfile, ParentProfile, NurseProfile, PharmacistProfile
from ..serializers import DoctorProfileSerializer, LabTechProfileSerializer, ParentProfileSerializer, NurseProfileSerializer, PharmacistProfileSerializer
from ..permissions import IsRoleUser 

# ALL THE VIEWS HERE ALLOW EACH USER TO MANAGE HIS/HER OWN PROFILE

class BaseProfileView(RetrieveModelMixin, CreateModelMixin, UpdateModelMixin,DestroyModelMixin, GenericAPIView):
    """
    Base view for role-based profile operations with full CRUD.
    It allows a user to retrieve, create, update, and delete their own profile.
    """
    permission_classes = [IsAuthenticated, IsRoleUser]
    serializer_class = None
    model_class = None
    role = None  # This should be set in each subclass (e.g., 'Doctor', 'Nurse', etc.)

    def get_object(self):
        if self.request.user.role != self.role:
            raise PermissionDenied({"detail": "Access Denied."})
        return get_object_or_404(self.model_class, user=self.request.user)

    def get(self, request, *args, **kwargs):
        """
        Retrieve the profile for the logged-in user.
        """
        return self.retrieve(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        """
        Create the profile for the logged-in user.
        If a profile already exists, returns an error.
        """
        if self.model_class.objects.filter(user=request.user).exists():
            return Response({"detail": "Profile already exists."}, status=status.HTTP_400_BAD_REQUEST)
        # When creating, we automatically assign the logged-in user as the profile owner.
        return self.create(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        """
        Update the profile of the logged-in user.
        """
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        """
        Delete the profile of the logged-in user.
        """
        return self.destroy(request, *args, **kwargs)

class DoctorProfileView(BaseProfileView):
    serializer_class = DoctorProfileSerializer
    model_class = DoctorProfile
    role = 'doctor'


class NurseProfileView(BaseProfileView):
    serializer_class = NurseProfileSerializer
    model_class = NurseProfile
    role = 'nurse'


class PharmacistProfileView(BaseProfileView):
    serializer_class = PharmacistProfileSerializer
    model_class = PharmacistProfile
    role = 'pharmacist'


class ParentProfileView(BaseProfileView):
    serializer_class = ParentProfileSerializer
    model_class = ParentProfile
    role = 'parent'


class LabTechProfileView(BaseProfileView):
    serializer_class = LabTechProfileSerializer
    model_class = ParentProfile
    role = 'lab_tech'






class DoctorProfileSearchView(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        query = request.GET.get("q", "")
        search = Search(index="doctorprofiles").query(
            "multi_match", query=query, fields=["first_name", "last_name", "specialization"]
        )
        results = search.execute()
        serialized_results = [DoctorProfileSerializer(hit.to_dict()).data for hit in results]
        return Response(serialized_results)


class NurseProfileSearchView(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        query = request.GET.get("q", "")
        search = Search(index="nurseprofiles").query(
            "multi_match", query=query, fields=["first_name", "last_name"]
        )
        results = search.execute()
        serialized_results = [NurseProfileSerializer(hit.to_dict()).data for hit in results]
        return Response(serialized_results)


class PharmacistProfileSearchView(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        query = request.GET.get("q", "")
        search = Search(index="pharmacistprofiles").query(
            "multi_match", query=query, fields=["first_name", "last_name", "license_number"]
        )
        results = search.execute()
        serialized_results = [PharmacistProfileSerializer(hit.to_dict()).data for hit in results]
        return Response(serialized_results)


class LabTechProfileSearchView(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        query = request.GET.get("q", "")
        search = Search(index="labtechprofiles").query(
            "multi_match", query=query, fields=["first_name", "last_name", "specialization"]
        )
        results = search.execute()
        serialized_results = [LabTechProfileSerializer(hit.to_dict()).data for hit in results]
        return Response(serialized_results)
