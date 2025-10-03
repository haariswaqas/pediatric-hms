// src/auth/PasswordResetConfirm.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import AuthService from '../services/AuthService';

export default function PasswordResetConfirm() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract uidb64 & token from query
  const params = new URLSearchParams(location.search);
  const uidb64 = params.get('uidb64');
  const token = params.get('token');

  useEffect(() => {
    if (!uidb64 || !token) {
      setError('Invalid reset link. Missing parameters.');
    }
  }, [uidb64, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      await AuthService.passwordResetConfirm(uidb64, token, newPassword);
      setMessage('✅ Password reset! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || '⚠️ Reset failed. Link may have expired.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <Lock className="mx-auto w-12 h-12 text-blue-500" />
          <h2 className="mt-4 text-3xl font-bold text-gray-800">Set New Password</h2>
          <p className="mt-2 text-gray-600">
            Choose a new password for your account.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-center">
            <AlertCircle /> <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="flex items-center gap-2 text-green-600 text-center">
            <CheckCircle /> <span>{message}</span>
          </div>
        )}

        {!error && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
            >
              {message ? <Loader className="animate-spin w-5 h-5" /> : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-gray-200 text-center">
          <Link to="/login" className="text-blue-500 hover:text-blue-700 font-medium">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
