// src/sidebars/SidebarApp.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import AdminSidebar from '../sidebars/AdminSidebar';
import DoctorSidebar from '../sidebars/DoctorSidebar';
import NurseSidebar from '../sidebars/NurseSidebar';
import PharmacistSidebar from '../sidebars/PharmacistSidebar';
import LabTechSidebar from '../sidebars/LabTechSidebar';
import ParentSidebar from '../sidebars/ParentSidebar';

export default function SidebarApp() {
  const { user } = useSelector((state) => state.auth);

  switch (user?.role) {
    case 'admin':
      return <AdminSidebar />;
    case 'doctor':
      return <DoctorSidebar />;
    case 'nurse':
      return <NurseSidebar />;
    case 'pharmacist':
      return <PharmacistSidebar />;
    case 'lab_tech':
      return <LabTechSidebar />;
    case 'parent':
      return <ParentSidebar />;
    default:
      return <div className="p-2 text-red-500 font-semibold">Unknown role: {user?.role}</div>;
  }
}
