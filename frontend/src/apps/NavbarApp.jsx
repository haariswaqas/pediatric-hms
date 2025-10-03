// src/apps/NavbarApp.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import AdminNavbar from '../navbars/AdminNavbar';
import DoctorNavbar from '../navbars/DoctorNavbar';
import NurseNavbar from '../navbars/NurseNavbar';
import PharmacistNavbar from '../navbars/PharmacistNavbar';
import LabTechNavbar from '../navbars/LabTechNavbar';
import ParentNavbar from '../navbars/ParentNavbar';

export default function NavbarApp({ toggleSidebar }) {
  const { user } = useSelector((state) => state.auth);

  switch (user?.role) {
    case 'admin':
      return <AdminNavbar toggleSidebar={toggleSidebar} />;
    case 'doctor':
      return <DoctorNavbar toggleSidebar={toggleSidebar} />;
    case 'nurse':
      return <NurseNavbar toggleSidebar={toggleSidebar} />;
    case 'pharmacist':
      return <PharmacistNavbar toggleSidebar={toggleSidebar} />;
    case 'lab_tech':
      return <LabTechNavbar toggleSidebar={toggleSidebar} />;
    case 'parent':
      return <ParentNavbar toggleSidebar={toggleSidebar} />;
    default:
      return <div className="p-2 text-red-500 font-semibold">Unknown role: {user?.role}</div>;
  }
}
