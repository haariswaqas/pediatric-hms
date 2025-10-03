// src/apps/DashboardApp.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import AdminDashboard from '../dashboards/AdminDashboard';
import DoctorDashboard from '../dashboards/DoctorDashboard';
import NurseDashboard from '../dashboards/NurseDashboard';
import PharmacistDashboard from '../dashboards/PharmacistDashboard';
import LabTechDashboard from '../dashboards/LabTechDashboard';
import ParentDashboard from '../dashboards/ParentDashboard';

export default function DashboardApp() {
  const { user } = useSelector((state) => state.auth);

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'nurse':
      return <NurseDashboard />;
    case 'pharmacist':
      return <PharmacistDashboard />;
    case 'lab_tech':
      return <LabTechDashboard />;
    case 'parent':
      return <ParentDashboard />;
    default:
      return <div className="p-8 text-red-600 font-bold">Unknown role: {user?.role}</div>;
  }
}
