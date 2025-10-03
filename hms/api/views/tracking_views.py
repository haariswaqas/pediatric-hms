from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models import Child


class ChildGrowthHistoryView(APIView):
    """
    Retrieve the growth history of a specific child.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        child = get_object_or_404(Child, pk=pk, primary_guardian=request.user.parentprofile)
        return Response(child.get_growth_history())
