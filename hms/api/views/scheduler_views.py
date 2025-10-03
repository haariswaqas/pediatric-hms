from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..serializers import AdmissionReportScheduleSerializer, VaccinationReportScheduleSerializer, DrugDispenseReportScheduleSerializer
from ..schedulers import set_user_report_schedule, get_admission_report_schedule, get_drug_dispense_report_schedule, set_drug_dispense_report_schedule, get_vaccination_report_schedule, set_vaccination_report_schedule
from ..permissions import IsAdminUser, IsPharmacistUser

class SetAdmissionReportScheduleView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = AdmissionReportScheduleSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            try:
                set_user_report_schedule(
                    every=data['every'],
                    period=data['period'],
                    enabled=data['enabled']
                )
                return Response(
                    {'message': 'Report schedule updated successfully.'},
                    status=status.HTTP_200_OK
                )
            except ValueError as e:
                return Response(
                    {'error': str(e)}, status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        try:
            schedule = get_admission_report_schedule()  # fetch current settings
            return Response(schedule, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {'error': str(e)}, status=status.HTTP_404_NOT_FOUND
            )

    
class SetVaccinationReportScheduleView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request):
        serializer = VaccinationReportScheduleSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            try:
                set_vaccination_report_schedule(
                    every=data['every'],
                    period=data['period'],
                    enabled=data['enabled']
                )
                return Response({'message': 'Report schedule updated successfully.'}, status=status.HTTP_200_OK)
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        try:
            schedule = get_vaccination_report_schedule()  # fetch current settings
            return Response(schedule, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {'error': str(e)}, status=status.HTTP_404_NOT_FOUND
            )
            
class SetDrugDispenseReportScheduleView(APIView):
    permission_classes = [IsPharmacistUser | IsAdminUser]
    def post(self, request):
        serializer = DrugDispenseReportScheduleSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            try:
                set_drug_dispense_report_schedule(
                    every=data['every'],
                    period=data['period'],
                    enabled=data['enabled']
                )
                return Response({'message': 'Drug Dispense Report schedule updated successfully.'}, status=status.HTTP_200_OK)
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def get(self, request):
        try:
            schedule = get_drug_dispense_report_schedule()
            return Response(schedule, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {'error': str(e)}, status=status.HTTP_404_NOT_FOUND
            )