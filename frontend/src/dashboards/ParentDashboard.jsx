import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import {Calendar, LogOut, CalendarRange, Pen, UserRoundMinus, Activity, ChartBar, TestTube, TestTubeDiagonalIcon, MessageCircleCode} from 'lucide-react';
import {ActionButton} from './components/ActionButton';
import {PARENT_CATEGORIES as CATEGORY} from './components/ActionCategories';


export default function ParentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.profile);

  const allActions = [
    {
      label: 'View Appointments',
      icon: <Calendar />, // Keeps Calendar for viewing appointments
      onClick: () => navigate('/appointments'),
      category: CATEGORY.APPOINTMENTS
    },
    {
      label: 'Book Appointment',
      icon: <CalendarRange />, // CalendarRange makes sense for booking a slot
      onClick: () => navigate('/appointments/add'),
      category: CATEGORY.APPOINTMENTS
    },
    {
      label: 'View Prescriptions',
      icon: <TestTube />, // TestTube for prescriptions/medications
      onClick: () => navigate('/prescriptions/items'),
      category: CATEGORY.PRESCRIPTIONS
    },
    {
      label: 'View Vaccinations',
      icon: <Activity />, // Activity icon can symbolize vaccines/health
      onClick: () => navigate('/vaccines/vaccination-records'),
      category: CATEGORY.VACCINATIONS
    },
    {
      label: 'Admissions',
      icon: <UserRoundMinus />, // User with minus can represent admissions/discharges
      onClick: () => navigate('/admissions'),
      category: CATEGORY.VACCINATIONS
    },
    {
      label: 'Children',
      icon: <UserRoundMinus />, // Could use same or another child/user icon if available
      onClick: () => navigate('/children'),
      category: CATEGORY.PATIENTS
    },
    {
      label: 'Chatbot',
      icon: <MessageCircleCode />, // Chatbot icon is already suitable
      onClick: () => navigate('/chatbot'),
      category: CATEGORY.PATIENTS
    },
    {
      label: 'Log out',
      icon: <LogOut />, // LogOut icon is correct
      onClick: () => dispatch(logout()),
      isDanger: true,
      category: CATEGORY.SYSTEM
    }
  ];
  
  
    return (
      <div className="p-8 bg-pink-100 dark:bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold text-pink-800 dark:text-blue-300 mb-4">Parent's Dashboard</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">Welcome, {profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : user?.username}! View appointments, manage your children's medical records.</p>
  
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
  
