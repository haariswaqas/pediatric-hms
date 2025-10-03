import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/auth/authSlice';
import {Calendar, LogOut, CalendarRange, Pen, UserRoundMinus, Activity, ChartBar, TestTube, TestTubeDiagonalIcon} from 'lucide-react';
import {ActionButton} from './components/ActionButton';
import {DOCTOR_CATEGORIES as CATEGORY} from './components/ActionCategories';



export default function DoctorDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.profile);

  const allActions = [
    {
      label: 'Today\'s Appointments',
      icon: <Calendar />,
      onClick: () => navigate('/appointments'),
      category: CATEGORY.APPOINTMENTS
    },

     {
      label: 'Add Prescription',
      icon: <Pen />,
      onClick: () => navigate('/prescriptions/add'),
      category: CATEGORY.APPOINTMENTS
    },
    {
      label: 'View Prescriptions',
      icon: <Pen />,
      onClick: () => navigate('/prescriptions'),
      category: CATEGORY.APPOINTMENTS
    },
    {
      label: 'Manage Patients',
      icon: <UserRoundMinus />,
      onClick: () => navigate('/children'),
      category: CATEGORY.PATIENTS
    },
    {
      label: 'View Vaccination Records',
      icon: <TestTubeDiagonalIcon />,
      onClick: () => navigate('/vaccines/vaccination-records'),
      category: CATEGORY.VACCINATIONS
    },
    {
      label: 'Diagnosis',
      icon: <TestTubeDiagonalIcon />,
      onClick: () => navigate('/diagnosis'),
      category: CATEGORY.VACCINATIONS
    },
    {
      label: 'Patient Reports',
      icon: <ChartBar />,
      onClick: () => navigate('/reports/patients'),
      category: CATEGORY.REPORTS
    },
  
    {
      label: 'Vaccination Schedule',
      icon: <TestTube />,
      onClick: () => navigate('/vaccines/schedule'),
      category: CATEGORY.VACCINATIONS
    },
    {
      label: 'Patient Analytics',
      icon: <Activity />,
      onClick: () => navigate('/analytics/patients'),
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
      <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-300 mb-4">Doctor's Dashboard</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">Welcome, {profile?.first_name && profile?.last_name ? `Dr. ${profile.first_name} ${profile.last_name}` : user?.username}! View appointments, manage patients, and update records here.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allActions.map((action, index) => (
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
