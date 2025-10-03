// src/apps/EssentialApp.jsx

import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from '../essentials/LandingPage';

export default function EssentialApp() {
  return (
    <Routes>
      {/* /home/ */}
      <Route path="/" element={<LandingPage />} />
      

      {/* catch-all under /home */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
