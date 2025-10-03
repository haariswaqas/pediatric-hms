// src/auth/Login.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {Lock, AlertCircle, Loader, Mail, Shield, Eye, EyeOff} from 'lucide-react';
import { loginSuccess, loginUser } from '../store/auth/authSlice';
import { ADMIN_PASSKEY_SALT, ADMIN_PASSKEY_HASH } from './config/constants';
import CryptoJS from 'crypto-js';
import { roleConfig } from './config/roleConfig';


export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(s => s.auth);

  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', role: '', passkey: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    if (isAuthenticated) navigate('/home');
  }, [isAuthenticated, navigate]);

  const validateField = (name, value) => {
    const errors = { ...formErrors };
    
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        errors.email = value && !emailRegex.test(value) 
          ? 'Please enter a valid email address' 
          : '';
        break;
      case 'password':
        errors.password = value.length < 6 
          ? 'Password must be at least 6 characters' 
          : '';
        break;
      case 'passkey':
        if (selectedRole === 'admin') {
          errors.passkey = !value ? 'Admin passkey is required' : '';
        }
        break;
      default:
        break;
    }
    
    setFormErrors(errors);
    return !errors[name];
  };

  const handleRole = (role) => {
    setSelectedRole(role);
    setForm(f => ({ ...f, role }));
    setError('');
    setFormErrors({});
    setTouchedFields({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    
    if (touchedFields[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const togglePasskeyVisibility = () => {
    setShowPasskey(prev => !prev);
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Validate email
    if (!form.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Validate password
    if (!form.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    // Validate admin passkey if role is admin
    if (selectedRole === 'admin' && !form.passkey) {
      errors.passkey = 'Admin passkey is required';
      isValid = false;
    }
    
    setFormErrors(errors);
    setTouchedFields({
      email: true,
      password: true,
      passkey: selectedRole === 'admin'
    });
    
    return isValid;
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
  // Admin passkey validation using hash
  if (form.role === 'admin') {
    const hashedInput = CryptoJS.MD5(form.passkey + ADMIN_PASSKEY_SALT).toString();
    if (hashedInput !== ADMIN_PASSKEY_HASH) {
      throw new Error('Invalid admin passkey');
    }
  }

  const data = await dispatch(loginUser(form)).unwrap();

  if (data.role !== form.role) {
    throw new Error(
      `You don't have access to the ${roleConfig[form.role].title} portal. Please use the correct portal for your role.`
    );
  }
  dispatch(loginSuccess({ access: data.access, refresh: data.refresh }));
  navigate('/home');

} catch (e) {
  if (e.response && e.response.data) {
    const backendError = e.response.data;
    if (backendError.non_field_errors) {
      setError(backendError.non_field_errors.join(' '));
    } else if (backendError.detail) {
      setError(backendError.detail);
    } else {
      const fieldErrors = {};
      let hasFieldErrors = false;

      for (const [key, value] of Object.entries(backendError)) {
        if (key !== 'non_field_errors') {
          fieldErrors[key] = Array.isArray(value) ? value.join(' ') : value;
          hasFieldErrors = true;
        }
      }

      if (hasFieldErrors) {
        setFormErrors(prev => ({ ...prev, ...fieldErrors }));
      } else {
        setError('An unexpected error occurred.');
      }
    }
  } else {
    setError(e.message || 'An unexpected error occurred.');
  }
} finally {
  setLoading(false);
}

  };

  // Get gradient based on selected role or use default
  const getBackgroundGradient = () => {
    if (!selectedRole) return 'from-green-300/70 to-blue-400/60';
    return roleConfig[selectedRole].gradient;
  };

  // Get card background based on selected role
  const getCardBackground = () => {
    if (!selectedRole) return 'bg-white/95';
    return roleConfig[selectedRole].cardBg;
  };

  // Get text color based on selected role
  const getTextColor = () => {
    if (!selectedRole) return 'text-gray-800';
    return roleConfig[selectedRole].textColor;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      {/* Background with dynamic gradient */}
      <div className="absolute inset-0">
        <img
          src="/images/login-background.jpg"
          alt="Healthcare background"
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient()} backdrop-blur-sm transition-all duration-700`} />
      </div>
      
      {/* Login Container with dynamic styling */}
      <div className={`relative z-10 w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-lg border transition-all duration-500 ${
        getCardBackground()
      } ${
        selectedRole === 'admin' ? 'border-gray-700' : 'border-white/20'
      }`}>
        
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <h1 className={`text-2xl font-bold mb-1 ${getTextColor()}`}>
            {selectedRole ? `${roleConfig[selectedRole].title} Login` : 'Healthcare Portal'}
          </h1>
          <p className={`text-sm ${selectedRole === 'admin' ? 'text-gray-400' : 'text-gray-600'}`}>
            {selectedRole ? 'Enter your credentials below' : 'Please select your role to continue'}
          </p>
        </div>
        
        {/* Role Selection Buttons */}
        <div className={`grid grid-cols-3 gap-3 mb-6 ${selectedRole ? 'opacity-80' : ''}`}>
          {Object.entries(roleConfig).map(([role, cfg]) => (
            <button
              key={role}
              onClick={() => handleRole(role)}
              className={`${cfg.bg} ${cfg.text} ${cfg.hover} p-3 rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${
                selectedRole === role ? 'ring-4 ring-blue-400 scale-105' : ''
              }`}
            >
              {cfg.icon}
              <span className="mt-2 text-sm font-medium">{cfg.title}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        {selectedRole && (
          <form onSubmit={submit} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 animate-fadeIn">
                <AlertCircle size={18} /> 
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                selectedRole === 'admin' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-3 ${
                  touchedFields.email && formErrors.email ? 'text-red-400' : 'text-gray-400'
                }`} size={18} />
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="you@example.com"
                  className={`pl-10 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                    selectedRole === 'admin'
                      ? 'bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 text-white'
                      : 'bg-white border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                  } ${
                    touchedFields.email && formErrors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : ''
                  }`}
                />
              </div>
              {touchedFields.email && formErrors.email && (
                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                selectedRole === 'admin' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-3 ${
                  touchedFields.password && formErrors.password ? 'text-red-400' : 'text-gray-400'
                }`} size={18} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`pl-10 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                    selectedRole === 'admin'
                      ? 'bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 text-white'
                      : 'bg-white border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                  } ${
                    touchedFields.password && formErrors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : ''
                  } pr-10`}
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {touchedFields.password && formErrors.password && (
                <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>

            {/* Admin Passkey */}
            {selectedRole === 'admin' && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Admin Passkey
                </label>
                <div className="relative">
                  <Shield className={`absolute left-3 top-3 ${
                    touchedFields.passkey && formErrors.passkey ? 'text-red-400' : 'text-gray-400'
                  }`} size={18} />
                  <input
                    name="passkey"
                    type={showPasskey ? "text" : "password"}
                    required
                    value={form.passkey}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter passkey"
                    className={`pl-10 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white pr-10 ${
                      touchedFields.passkey && formErrors.passkey 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : ''
                    }`}
                  />
                  <button 
                    type="button"
                    onClick={togglePasskeyVisibility}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 focus:outline-none"
                  >
                    {showPasskey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {touchedFields.passkey && formErrors.passkey && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.passkey}</p>
                )}
              </div>
            )}

            {/* Links Row */}
            <div className="flex justify-between text-sm pt-2">
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className={`font-medium transition-colors duration-200 ${
                  selectedRole === 'admin' 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                ← Change Role
              </button>
              <Link
                to="/auth/password-reset-request"
                className={`font-medium transition-colors duration-200 ${
                  selectedRole === 'admin' 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Forgot Password?
              </Link>
              <Link
                to="/auth/register"
                className={`font-medium transition-colors duration-200 ${
                  selectedRole === 'admin' 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Register
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 mt-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-105 hover:scale-[1.01] active:scale-[0.99]'
              } ${roleConfig[selectedRole].bg} ${roleConfig[selectedRole].text}`}
            >
              {loading ? <Loader className="animate-spin" size={20} /> : 'Sign In'}
              {!loading && roleConfig[selectedRole].icon}
            </button>
          </form>
        )}
        
        {/* Helper Text */}
        <p className={`text-center mt-6 text-xs ${selectedRole === 'admin' ? 'text-gray-500' : 'text-gray-500'}`}>
          Protected by secure authentication. Your information is safe with us.
        </p>
      </div>
    </div>
  );
}