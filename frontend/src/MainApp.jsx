// src/MainApp.jsx

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import TokenRefresher from './auth/TokenRefresher';

import AuthApp from './apps/AuthApp';
import EssentialApp from './apps/EssentialApp';
import ProfileApp from './apps/ProfileApp';
import UserManagementApp from './apps/UserManagementApp';
import RoleManagementApp from './apps/RoleManagementApp';
import ChildManagementApp from './apps/ChildManagementApp';
import ReportApp from './apps/ReportApp';
import LoggingApp from './apps/LoggingApp';
import ShiftApp from './apps/ShiftApp';
import WardApp from './apps/WardApp';
import VaccinationApp from './apps/VaccinationApp';
import DiagnosisApp from './apps/DiagnosisApp';
import DrugApp from './apps/DrugApp';
import PrescriptionApp from './apps/PrescriptionApp';
import AppointmentApp from './apps/AppointmentApp';
import ProfileManagementApp from './apps/ProfileManagementApp';
import NavbarApp from './apps/NavbarApp';
import SidebarApp from './apps/SidebarApp';
import AdmissionApp from './apps/AdmissionApp';
import BillingApp from './apps/BillingApp';
import LabApp from './apps/LabApp';
import SchedulerApp from './apps/SchedulerApp';
import ChatbotApp from './apps/ChatbotApp';
function AppWithNavbar() {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Hide navbar & sidebar on auth routes
  const hideNav = location.pathname.startsWith('/auth');

  // Sidebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen((open) => !open);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Keep token auto-refresh running */}
      <TokenRefresher />

      {/* Navbar at the top */}
      {!hideNav && user && (
        <div className="w-full z-10">
          <NavbarApp toggleSidebar={toggleSidebar} />
        </div>
      )}

      {/* Sidebar + Main content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {!hideNav && user && sidebarOpen && (
          <aside className="w-64 border-r bg-white">
            <SidebarApp />
          </aside>
        )}

        {/* Main router outlet */}
        <main className="flex-1 p-4">
          <Routes>
            <Route path="auth/*" element={<AuthApp />} />
            <Route path="home/*" element={<EssentialApp />} />
            <Route path="profile/*" element={<ProfileApp />} />
            <Route path="users/*" element={<UserManagementApp />} />
            <Route path="role-management/*" element={<RoleManagementApp />} />
            <Route path="children/*" element={<ChildManagementApp />} />
            <Route path="logging/*" element={<LoggingApp />} />
            <Route path="shifts/*" element={<ShiftApp />} />
            <Route path="wards/*" element={<WardApp />} />
            <Route path="appointments/*" element={<AppointmentApp />} />
            <Route path="admissions/*" element={<AdmissionApp />} />
            <Route path="reports/*" element={<ReportApp />} />
            <Route path="vaccines/*" element={<VaccinationApp />} />
            <Route path="diagnosis/*" element={<DiagnosisApp />} />
            <Route path="drugs/*" element={<DrugApp />} />
            <Route path="prescriptions/*" element={<PrescriptionApp />} />
            <Route path="profiles/*" element={<ProfileManagementApp />} />
            <Route path="labs/*" element={<LabApp />} />
            <Route path="billing/*" element={<BillingApp />} />
            <Route path="chatbot/*" element={<ChatbotApp />} />
            <Route path="schedules/*" element={<SchedulerApp />} />
            <Route path="/" element={<Navigate to="/home/" replace />} />
          
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function MainApp() {
  return (
    <Router>
      <AppWithNavbar />
    </Router>
  );
}
