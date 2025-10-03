// src/apps/AuthApp.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../auth/Login';
import Register from '../auth/Register';
import OTPVerification from '../auth/OTPVerification';
import PasswordResetRequest from '../auth/PasswordResetRequest';
import PasswordResetConfirm from '../auth/PasswordResetConfirm';

export default function AuthApp() {
  return (
    <Routes>
      {/* /auth/ */}
      <Route path="/" element = {<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="verify-otp" element={<OTPVerification />} />
      <Route path="password-reset-request" element={<PasswordResetRequest />} />
      <Route path="password-reset-confirm" element={<PasswordResetConfirm />} />

      {/* catch-all under /auth */}
      <Route path="*" element={<Navigate to="/auth/" replace />} />
    </Routes>
  );
}
