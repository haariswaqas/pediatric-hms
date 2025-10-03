from django.contrib import admin
from .models import (User, OTP, SystemLog, Report, RolePermissionModel, DoctorProfile, NurseProfile, PharmacistProfile, 
                     LabTechProfile, ParentProfile, Child, Conversation, Message, GrowthRecord, Ward, Bed, 
                     Shift, DoctorShiftAssignment, NurseShiftAssignment,
                     PharmacistShiftAssignment, LabTechShiftAssignment, 
                     Notification, Appointment, 
                     Vaccine, VaccinationRecord, 
                     AdmissionRecord, AdmissionVitalRecord, AdmissionVitalRecordHistory, 
                     Diagnosis, DiagnosisAttachment, Treatment,
                     Drug, DrugInteraction, DrugDispenseRecord, Prescription, PrescriptionItem, AdverseReaction, 
                     LabTest, ReferenceRange, LabRequest, LabRequestItem, LabResult, LabResultParameter,
                     Bill, BillItem, Payment

)
add = admin.site.register

add(User)
add(OTP)
add(SystemLog)
add(Report)
add(RolePermissionModel)
add(DoctorProfile)
add(NurseProfile)
add(PharmacistProfile)
add(LabTechProfile)
add(ParentProfile)
add(Child)
add(Conversation)
add(Message)
add(GrowthRecord)
add(Shift)
add(DoctorShiftAssignment)
add(NurseShiftAssignment)
add(PharmacistShiftAssignment)
add(LabTechShiftAssignment)
add(Ward)
add(Bed)
add(Notification)
add(Appointment)
add(Vaccine)
add(VaccinationRecord)
add(AdmissionRecord)
add(AdmissionVitalRecord)
add(AdmissionVitalRecordHistory)
add(Diagnosis)
add(DiagnosisAttachment)
add(Treatment)
add(Drug)
add(DrugInteraction)
add(DrugDispenseRecord)
add(Prescription)
add(PrescriptionItem)
add(AdverseReaction)
add(LabTest)
add(ReferenceRange)
add(LabRequest)
add(LabRequestItem)
add(LabResult)
add(LabResultParameter)
add(Bill)
add(BillItem)
add(Payment)