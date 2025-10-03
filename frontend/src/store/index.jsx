// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import profileReducer from './profile/profileSlice';
import userManagementReducer from './admin/userManagementSlice';
import roleManagementReducer from './admin/roleManagementSlice';
import childManagementReducer from './children/childManagementSlice';
import profileManagementReducer from './admin/profileManagementSlice';
import systemLogsReducer from './admin/systemLogSlice';
import notificationReducer from './notifications/notificationSlice';
import shiftReducer from './shifts/shiftSlice';

import doctorShiftAssignmentReducer from './shifts/doctorShiftAssignmentSlice';
import nurseShiftAssignmentReducer from './shifts/nurseShiftAssignmentSlice';
import pharmacistShiftAssignmentReducer from './shifts/pharmacistShiftAssignmentSlice';
import labtechShiftAssignmentReducer from './shifts/labtechShiftAssignmentSlice';

import admissionReducer from './admissions/admissionSlice';
import admissionVitalReducer from './admissions/admissionVitalSlice';
import wardReducer from './admin/wardSlice';
import bedReducer from './admin/bedSlice';
import vaccineReducer from './vaccination/vaccineSlice';
import vaccinationRecordReducer from './vaccination/vaccinationRecordSlice';

import reportReducer from './report/reportSlice';
import appointmentReducer from './appointments/appointmentSlice';

import diagnosisReducer from './diagnosis/diagnosisSlice';
import treatmentReducer from './diagnosis/treatmentSlice';
import attachmentReducer from './diagnosis/attachmentSlice';

import drugReducer from './drugs/drugSlice';
import drugInteractionReducer from './drugs/drugInteractionSlice';
import drugDispenseReducer from './drugs/drugDispenseSlice';
import prescriptionReducer from './prescriptions/prescriptionSlice';
import prescriptionItemReducer from './prescriptions/prescriptionItemSlice';

import labTestReducer from './lab/labTestSlice';
import labRequestReducer from './lab/labRequestSlice';
import labRequestItemReducer from './lab/labRequestItemSlice';
import labResultReducer from './lab/labResultSlice';
import labResultParameterReducer from './lab/labResultParameterSlice';
import referenceRangeReducer from './lab/referenceRangeSlice';

import billReducer from './billing/billSlice';
import billItemReducer from './billing/billItemSlice';
import paymentReducer from './billing/paymentSlice';
import billGenerationReducer from './billing/billGenerationSlice';

import admissionReportScheduleReducer from './scheduler/admissionReportScheduleSlice';
import appointmentReminderScheduleReducer from './scheduler/appointmentReminderScheduleSlice';
import vaccinationReportScheduleReducer from './scheduler/vaccinationReportScheduleSlice';
import vaccinationReminderScheduleReducer from './scheduler/vaccinationReminderScheduleSlice';
import chatbotReducer from './chatbot/chatbotSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    userManagement: userManagementReducer,
    roleManagement: roleManagementReducer,
    childManagement: childManagementReducer,
    profileManagement: profileManagementReducer,
    systemLogs: systemLogsReducer,
    notifications: notificationReducer,
    shifts: shiftReducer,
    doctorShiftAssignment: doctorShiftAssignmentReducer,
    nurseShiftAssignment:  nurseShiftAssignmentReducer,
    pharmacistShiftAssignment: pharmacistShiftAssignmentReducer,
    labtechShiftAssignment: labtechShiftAssignmentReducer,
    admission: admissionReducer,
    admissionVital: admissionVitalReducer,
    appointment: appointmentReducer,
    ward: wardReducer,
    bed: bedReducer,
    vaccine: vaccineReducer,
    vaccinationRecord: vaccinationRecordReducer,
   
    report: reportReducer,
    diagnosis: diagnosisReducer,
    treatment: treatmentReducer,
    attachment: attachmentReducer,
   
    drug: drugReducer,
    drugInteraction: drugInteractionReducer,
    drugDispense: drugDispenseReducer,
    prescription: prescriptionReducer, 
    prescriptionItem: prescriptionItemReducer,

    labTest: labTestReducer,
    labRequest: labRequestReducer,
    labRequestItem: labRequestItemReducer,
    labResult: labResultReducer,
    labResultParameter: labResultParameterReducer,
    referenceRange: referenceRangeReducer,

    bill: billReducer,
    billItem: billItemReducer,
    payment: paymentReducer,
    billGeneration: billGenerationReducer,
    admissionReportSchedule: admissionReportScheduleReducer,
    vaccinationReportSchedule: vaccinationReportScheduleReducer,
    appointmentReminderSchedule: appointmentReminderScheduleReducer,
    vaccinationReminderSchedule: vaccinationReminderScheduleReducer,

    chatbot: chatbotReducer,
  },
});
