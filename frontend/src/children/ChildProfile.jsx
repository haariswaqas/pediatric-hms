import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildById, clearSelectedChild } from '../store/children/childManagementSlice';
import { fetchVaccinationRecords, clearSelectedVaccinationRecord } from '../store/vaccination/vaccinationRecordSlice';
import { fetchAppointments, clearSelectedAppointment } from '../store/appointments/appointmentSlice';
import { fetchPrescriptionItems, clearSelectedPrescriptionItem } from '../store/prescriptions/prescriptionItemSlice';
import { fetchAdmissions, clearSelectedAdmission } from '../store/admissions/admissionSlice';
import {fetchMedicalHistoryPdf as fetchChildMedicalHistoryPdf} from '../store/children/childManagementSlice'; // Add this import
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Hospital, Users, Activity, AlertCircle, BookOpen, Calendar, Syringe, Pill, ExternalLink, Download } from 'lucide-react';

// Import custom components
import ProfileHeader from './child-profile-components/ProfileHeader';
import InfoCard from './child-profile-components/InfoCard';
import MedicalRecordSection from './child-profile-components/MedicalRecordSection';
import LoadingSpinner from './child-profile-components/LoadingSpinner';
import ErrorMessage from './child-profile-components/ErrorMessage';
import ActionButtons from './child-profile-components/ActionButtons';

import { hasAnyRole } from '../utils/roles';
export default function ChildProfile() {
  const { childId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const {user} = useSelector((state)=>state.auth);
  const allowedRoles = ["admin", "doctor", "nurse"];
  const { selectedChild: c, loading: childLoading, error: childError } = useSelector(state => state.childManagement);
  const { vaccinationRecords, loading: vacLoading, error: vacError } = useSelector(state => state.vaccinationRecord);
  const { appointments, loading: appLoading, error: appError } = useSelector(state => state.appointment);
  const { admissions, loading: admLoading, error: admError } = useSelector(state => state.admission);
  const { prescriptionItems, loading: presLoading, error: presError } = useSelector(state => state.prescriptionItem);
  const { loading: pdfLoading, error: pdfError } = useSelector(state => state.childManagement); // Add this selector

  useEffect(() => {
    if (childId) {
      dispatch(fetchChildById(childId));
      dispatch(fetchVaccinationRecords());
      dispatch(fetchAppointments());
      dispatch(fetchPrescriptionItems());
      dispatch(fetchAdmissions());
    }
    
    return () => {
      dispatch(clearSelectedChild());
      dispatch(clearSelectedVaccinationRecord());
      dispatch(clearSelectedAppointment());
      dispatch(clearSelectedPrescriptionItem());
      dispatch(clearSelectedAdmission());
    };
  }, [dispatch, childId]);

  // Function to handle PDF download following the BillList pattern
  const handleGenerateMedicalHistoryPdf = async () => {
    if (!c || !c.id) return;
    
    const result = await dispatch(fetchChildMedicalHistoryPdf(c.id));
    if (result.meta.requestStatus === "fulfilled") {
      const fileUrl = result.payload.fileUrl;
      window.open(fileUrl, "_blank");
    } else {
      console.error("Failed to generate medical history PDF:", result.payload);
    }
  };

  if (childLoading || vacLoading || !c) return <LoadingSpinner />;
  if (childError) return <ErrorMessage message={childError} />;
  if (vacError) return <ErrorMessage message={vacError} type="Vaccination" />;
  if (appError) return <ErrorMessage message={appError} type="Appointment" />;
  if (presError) return <ErrorMessage message={presError} type="Prescription" />;
  if (admError) return <ErrorMessage message={admError} type="Admission" />;
  if (pdfError) return <ErrorMessage message={pdfError} type="PDF Generation" />;

  // Filter records for this child by comparing record.child.id with c.id
  const childVaccines = vaccinationRecords.filter(vaccinationRecord => 
    vaccinationRecord.child_details?.id === c.id
  );
  
  const childAppointments = appointments.filter(appointment => 
    appointment.child_details?.id === c.id
  );
  
  const childPrescriptions = prescriptionItems.filter(prescriptionItem => 
    prescriptionItem.child_details?.id === c.id
  );

  const childAdmissions = admissions.filter(admission => 
    admission.child_details?.id === c.id
  );

  // Group data for info cards with more detailed formatting
  const personalInfo = [
    { 
      label: "Date of Birth", 
      value: c.date_of_birth,
      timestamp: c.date_of_birth ? `${new Date().getFullYear() - new Date(c.date_of_birth).getFullYear()} years old` : null
    },
    { label: "Age", value: c.age },
    { label: "Gender", value: c.gender },
    { 
      label: "Email", 
      value: c.email || '–',
      highlight: !!c.email 
    },
  ];

  const guardianInfo = [
    { 
      label: "Primary Guardian", 
      value: c.guardian_details ? `${c.guardian_details.first_name} ${c.guardian_details.last_name}` : '–',
      highlight: !!c.guardian_details 
    },
    { label: "Relation", value: c.relationship_to_primary_guardian || '–' },
    
    
  ];

  const vitalsInfo = [
    { 
      label: "Weight", 
      value: c.current_weight || '–', 
      suffix: c.current_weight ? 'kg' : null,
      status: c.weight_status || null,
      statusText: c.weight_status_text
    },
    { 
      label: "Height", 
      value: c.current_height || '–', 
      suffix: c.current_height ? 'cm' : null
    },
    { 
      label: "BMI", 
      value: c.current_bmi || '–',
      status: c.bmi_status || null,
      statusText: c.bmi_status_text
    },
    { label: "Blood Group", value: c.blood_group || '–' },
    { 
      label: "Allergies", 
      value: c.allergies || '–',
      status: c.allergies ? 'warning' : null,
      statusText: c.allergies ? 'Important' : null
    },
  ];

  const educationInfo = [
    { label: "School", value: c.school || '–' },
    { label: "Grade", value: c.grade || '–' },
    { label: "Teacher", value: c.teacher_name || '–' },
    { 
      label: "Emergency Contact", 
      value: c.emergency_contact_name || '–',
      highlight: !!c.emergency_contact_name 
    },
    { 
      label: "Emergency Phone", 
      value: c.emergency_contact_phone || '–',
      highlight: !!c.emergency_contact_phone
    },
  ];

  // Medical records sections configuration
  const medicalSections = [
    {
      id: "history",
      title: "Medical History",
      icon: <BookOpen size={18} />,
      content: c.medical_history || 'No medical history recorded.',
    },
    {
      id: "family",
      title: "Family & Developmental Notes",
      icon: <Users size={18} />,
      content: (
        <>
          <h4 className="font-medium mb-2">Family Medical History</h4>
          <p className="whitespace-pre-wrap mb-3">{c.family_medical_history || '–'}</p>
          <h4 className="font-medium mb-2">Developmental Notes</h4>
          <p className="whitespace-pre-wrap">{c.developmental_notes || '–'}</p>
        </>
      ),
    },
    {
      id: "vaccines",
      title: "Vaccination Records",
      icon: <Syringe size={18} />,
      count: childVaccines.length,
      items: childVaccines,
      itemRenderer: (record) => ({
        title: record.vaccine_details?.name,
        date: record.administered_date,
        details: [
          { label: "Administered by", value: `${record.administered_by_details.first_name} ${record.administered_by_details.last_name}` },
          { label: "Batch Number", value: record.batch_number },
        ]
      })
    },
    {
      id: "appointments",
      title: "Appointments",
      icon: <Calendar size={18} />,
      count: childAppointments.length,
      items: childAppointments,
      itemRenderer: (appointment) => ({
        title: (
          <Link 
            to={`/appointments/${appointment.id}`} 
            className="text-blue-600 hover:underline inline-flex items-center"
          >
            {appointment.appointment_date}
            <ExternalLink className="ml-1 w-4 h-4" />
          </Link>
        ),
        details: [
          { label: "Time", value: appointment.appointment_time },
          { label: "Status", value: appointment.status || "Scheduled" }
        ]
      })
    },
    {
      id: "prescriptions",
      title: "Prescriptions",
      icon: <Pill size={18} />,
      count: childPrescriptions.length,
      items: childPrescriptions,
      itemRenderer: (prescriptionItem) => ({
        title: prescriptionItem.drug_details?.name,
        subtitle: prescriptionItem.drug_details?.strength,
        date: prescriptionItem.prescription_details?.prescription_date,
        details: [
          { label: "Prescribed by", value: `Dr. ${prescriptionItem.prescription_details?.doctor_first_name} ${prescriptionItem.prescription_details?.doctor_last_name}` },
          { label: "Instructions", value: prescriptionItem.instructions }
        ]
      })
    },
    {
      id: "admissions",
      title: "Admissions",
      icon: <Hospital size={18} />,
      count: childAdmissions.length,
      items: childAdmissions,
      itemRenderer: (admission) => ({
        title: (
          <Link 
          to={`/admissions/detail/${admission.id}`} 
          className="text-blue-600 hover:underline inline-flex items-center"
        >
          Admitted On{" "}
          {admission.admission_date 
            ? new Date(admission.admission_date).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              }) 
            : "N/A"}
          <ExternalLink className="ml-1 w-4 h-4" />
        </Link>
        
        ),
        details: [
          { label: "Diagnosis", value: admission.diagnosis_details?.title },
          { 
            label: "Discharged by", 
            value: admission.discharge_date && admission.attending_doctor_details
              ? `${admission.attending_doctor_details.first_name} ${admission.attending_doctor_details.last_name}`
              : "N/A" 
          },
          { 
            label: "Status", 
            value: admission.discharge_date ? "Discharged" : "Admitted" 
          },
          { 
            label: "Discharge Date", 
            value: admission.discharge_date 
              ? new Date(admission.discharge_date).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true
                })
              : "Not discharged" 
          }
        ]
        
      })
    }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-10">
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="mb-6 flex items-center justify-between">
      <div className="max-w-9xl mx-auto w-full px-4">
  {/* Back button */}
  <button
    onClick={() => navigate(-1)}
    className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mb-6"
  >
    <ArrowLeft size={16} className="mr-1" /> Back to children
  </button>

  {/* Profile header with basic patient info */}
  <ProfileHeader 
    child={c}
    onEdit={() => navigate(`/children/edit/${c.id}`)}
  />
</div>


        <div className="text-sm text-gray-600 dark:text-gray-300">
          {pdfLoading && <span className="mr-3">Generating PDF...</span>}
        </div>
      </div>

{/* Download Medical History PDF button */}
{hasAnyRole(user, allowedRoles) && (
  <div className="mt-4">
    <button
      onClick={() => setShowConfirm(true)}
      disabled={pdfLoading}
      className={`inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md shadow transition-colors ${
        pdfLoading 
          ? "bg-gray-400 cursor-not-allowed" 
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {pdfLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Generating PDF...
        </>
      ) : (
        <>
          <Download size={16} className="mr-2" />
          Download Medical History PDF
        </>
      )}
    </button>
  </div>
)}


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left column for patient info */}
          <div className="lg:col-span-1 space-y-6">
            <InfoCard 
              title="Personal Information"
              icon={<User className="text-blue-500" size={18} />}
              items={personalInfo}
              isEditable={true}
              onEdit={() => navigate(`/children/edit/${c.id}?section=personal`)}
            />
            
            <InfoCard 
              title="Guardian Information"
              icon={<Users className="text-purple-500" size={18} />}
              items={guardianInfo}
              isEditable={true}
              onEdit={() => navigate(`/children/edit/${c.id}?section=guardian`)}
              highlightEmptyValues={true}
            />
            
            <InfoCard 
              title="Vitals & Medical"
              icon={<Activity className="text-red-500" size={18} />}
              items={vitalsInfo}
              isEditable={true}
              onEdit={() => navigate(`/children/edit/${c.id}?section=medical`)}
              footerLink={{
                url: `/children/${c.id}/vitals-history`,
                text: "View vitals history",
                icon: <ExternalLink size={12} />
              }}
            />
            
            <InfoCard 
              title="Education & Emergency"
              icon={<AlertCircle className="text-amber-500" size={18} />}
              items={educationInfo}
              isEditable={true}
              onEdit={() => navigate(`/children/edit/${c.id}?section=education`)}
              highlightEmptyValues={true}
              maxVisible={3}
            />

            {/* Action buttons for medical professionals */}
            <ActionButtons childId={childId} />
          </div>

          {/* Right column for medical records */}
          <div className="lg:col-span-2 space-y-6">
            {medicalSections.map((section) => (
              <MedicalRecordSection 
                key={section.id}
                {...section}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && c && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Generate Medical History PDF</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Do you want to generate a medical history PDF for <strong>{c.first_name} {c.last_name}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleGenerateMedicalHistoryPdf();
                }}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Yes, Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}