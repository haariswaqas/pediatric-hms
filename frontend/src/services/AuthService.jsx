// src/services/AuthService.jsx

import axios from 'axios';
import API from './api';  

const AuthService = {

  // Register service
  register: async (formData) => {
    try {
      // formData should be a FormData instance when you need file uploads
      const res = await axios.post(`${API}/register/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      // err.response.data might be an object or string
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Registration failed';
      throw new Error(message);
    }
  },

  // Login service
  login: async (credentials) => {
    try {
      // credentials is a plain object { email, password }
      const res = await axios.post(`${API}/login/`, credentials, {
        headers: { 'Content-Type': 'application/json' },
      });
      return res.data;  // expect { token: '...', user: { ... } } or similar
    } catch (err) {
      let message = 'Login failed';
    
      if (err.response?.data?.detail) {
        message = err.response.data.detail;
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.data?.non_field_errors) {
        message = err.response.data.non_field_errors[0];  // pick the first error
      } else if (typeof err.response?.data === 'string') {
        message = err.response.data;
      } else if (typeof err.response?.data === 'object') {
        message = JSON.stringify(err.response.data);
      } else if (err.message) {
        message = err.message;
      }
    
      throw new Error(message);
    }
    
  },

  // OTP Verification service
  verifyOTP: async (email, otp) => {
    try {
      const res = await axios.post(
        `${API}/verify-otp/`,
        { email, otp },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return res.data;  // expect { success: true } or similar
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        err.message ||
        'OTP verification failed';
      throw new Error(message);
    }
  },

  resendOTP: async (email) => {
    try {
      const res = await axios.post(
        `${API}/resend-otp/`,
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return res.data;  // expect { message: "OTP resent successfully" } or similar
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Resending OTP failed';
      throw new Error(message);
    }
  },

  

  passwordResetRequest: async (email) => {
    try {
      const res = await axios.post(
        `${API}/password-reset-request/`,
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return res.data;  // expect { message: '...' }
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Password reset request failed';
      throw new Error(message);
    }
  },

  passwordResetConfirm: async (uidb64, token, newPassword) => {
    try {
      const res = await axios.post(
        `${API}/password-reset-confirm/`,
        { uidb64, token, new_password: newPassword },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return res.data;  // e.g. { message: "Password reset successful" }
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Password reset confirmation failed';
      throw new Error(message);
    }
  },

  refreshToken: async (refresh) => {
    try {
      const res = await axios.post(`${API}/token-refresh/`, { refresh }, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('[TokenRefresh response]', res.data);
      return res.data;  // usually { access: 'new_access_token' }
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Token refresh failed';
      throw new Error(message);
    }
  },
  


};

export default AuthService;
