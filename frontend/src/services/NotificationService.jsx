// src/services/NotificationService.jsx
import axios from 'axios';
import API from './api';

const NotificationService = {
  fetchNotifications: async (token) => {
    try {
      const res = await axios.get(`${API}/notifications/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      if (err.response) {
        const message = err.response.data?.detail || 
                        err.response.data?.message || 
                        JSON.stringify(err.response.data);
        throw new Error(`Server error: ${message}`);
      } else if (err.request) {
        throw new Error('No response from server');
      } else {
        throw new Error(`Request error: ${err.message}`);
      }
    }
  },

  readNotification: async (id, token) => {
    try {
      const res = await axios.post(`${API}/notifications/${id}/read/`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      if (err.response) {
        const message = err.response.data?.detail || 
                        err.response.data?.message || 
                        JSON.stringify(err.response.data);
        throw new Error(`Server error: ${message}`);
      } else if (err.request) {
        throw new Error('No response from server');
      } else {
        throw new Error(`Request error: ${err.message}`);
      }
    }
  },
};

export default NotificationService;
