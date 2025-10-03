from django.urls import path
from ..views import (
    SetAdmissionReportScheduleView,
    SetVaccinationReportScheduleView,
    SetParentVaccinationReminder,
    SetMedicalProfessionalVaccinationReminder,
    SetAppointmentReminder,
    SetDrugDispenseReportScheduleView,
    SetDoctorAppointmentReminder
)

urlpatterns = [
    path('schedule-admission-report/', SetAdmissionReportScheduleView.as_view(), name='schedule-admission-report'),
    path('schedule-vaccination-report/', SetVaccinationReportScheduleView.as_view(), name='schedule-vaccination-report'),
    path('schedule-drug-dispense-report/', SetDrugDispenseReportScheduleView.as_view(), name='schedule-drug-dispense-report'),
    path('parent/set-vaccination-reminder/', SetParentVaccinationReminder.as_view(), name='parent-vaccination-reminder'),
    path('medical/set-vaccination-reminder/', SetMedicalProfessionalVaccinationReminder.as_view(), name='medical-vaccination-reminder'),
    path('appointment/set-reminder/', SetAppointmentReminder.as_view(), name='appointment-reminder'),
    path('doctor/set-appointment-reminder/', SetDoctorAppointmentReminder.as_view(), name='doctor-appointment-reminder'),
]
