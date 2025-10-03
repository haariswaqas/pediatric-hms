import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/auth/authSlice';
import {
  Calendar,
  LogOut,
  Activity,
  Stethoscope,
  UserRoundPlus,
  TestTube,
  ClipboardCheck,
  Syringe,
  FileText
} from 'lucide-react';
import { ActionButton } from './components/ActionButton';
import { NURSE_CATEGORIES as CATEGORY } from './components/ActionCategories';

export default function NurseDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.profile);

  const nurseActions = [
    {
      label: "Today's Appointments",
      icon: <Calendar />,
      onClick: () => navigate('/appointments'),
      category: CATEGORY.APPOINTMENTS
    },
    {
      label: 'Record Vitals',
      icon: <Stethoscope />,
      onClick: () => navigate('/admissions/add-vitals'),
      category: CATEGORY.PATIENT_CARE
    },
    {
      label: 'View Admissions',
      icon: <Stethoscope />,
      onClick: () => navigate('/admissions'),
      category: CATEGORY.PATIENT_CARE
    },
    {
      label: 'View Patient Vitals',
      icon: <Activity />,
      onClick: () => navigate('/admissions/vital-histories'),
      category: CATEGORY.PATIENT_CARE
    },
    {
      label: 'View Diagnoses',
      icon: <Stethoscope />,
      onClick: () => navigate('/diagnosis'),
      category: CATEGORY.PATIENT_CARE
    },
    {
      label: 'View Patients',
      icon: <Stethoscope />,
      onClick: () => navigate('/children'),
      category: CATEGORY.PATIENT_CARE
    },
    {
      label: 'Admit New Patient',
      icon: <UserRoundPlus />,
      onClick: () => navigate('/children/add'),
      category: CATEGORY.PATIENT_CARE
    },
    {
      label: 'Vaccination Records',
      icon: <Syringe />,
      onClick: () => navigate('/vaccines/vaccination-records'),
      category: CATEGORY.VACCINATIONS
    },
{
  label: 'View Prescriptions',
  icon: <TestTube />,
  onClick: () => navigate('/prescriptions/items'),
  category: CATEGORY.VACCINATIONS
},
{
  label: 'View Lab Requests',
  icon: <TestTube />,
  onClick: () => navigate('/labs/lab-request-items'),
  category: CATEGORY.VACCINATIONS
},
{
  label: 'View Lab Results',
  icon: <TestTube />,
  onClick: () => navigate('/labs/lab-result-parameters'),
  category: CATEGORY.VACCINATIONS
},
    {
      label: 'Reports',
      icon: <FileText />,
      onClick: () => navigate('/reports'),
      category: CATEGORY.REPORTS
    },
     {
      label: 'Log out',
      icon: <LogOut />,
      onClick: () => dispatch(logout()),
      isDanger: true,
      category: CATEGORY.SYSTEM
    }
  ];

  return (
    <div className="p-8 bg-blue-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-300 mb-4">
        Nurse Dashboard
      </h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Welcome, {profile?.first_name && profile?.last_name
          ? `Nurse ${profile.first_name} ${profile.last_name}`
          : user?.username}! Manage patient vitals, vaccination records, and reports here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nurseActions.map((action, index) => (
          <ActionButton
            key={index}
            label={action.label}
            icon={action.icon}
            onClick={action.onClick}
            isDanger={action.isDanger}
            badge={action.badge}
            isActive={action.isActive}
          />
        ))}
      </div>
    </div>
  );
}
