// src/auth/PasswordResetRequest.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import AuthService from '../services/AuthService';

export default function PasswordResetRequest() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const data = await AuthService.passwordResetRequest(email);
      setMessage(data.message || '✅ Link sent! Check your inbox.');
    } catch (err) {
      setError(err.message || '⚠️ Unable to process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <Mail className="mx-auto w-12 h-12 text-blue-500" />
          <h2 className="mt-4 text-3xl font-bold text-gray-800">Forgot Password?</h2>
          <p className="mt-2 text-gray-600">
            Enter your email and we’ll send a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold transition"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" /> Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        {message && (
          <div className="flex items-center gap-2 text-green-600 text-center">
            <CheckCircle /> <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-center">
            <AlertCircle /> <span>{error}</span>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 text-center">
          <Link to="/auth/login" className="text-blue-500 hover:text-blue-700 font-medium">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
