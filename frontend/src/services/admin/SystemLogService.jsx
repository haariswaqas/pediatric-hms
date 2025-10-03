// src/services/admin/SystemLogService.jsx
import axios from 'axios';
import API from '../api';

const SystemLogService = {
  fetchSystemLogs: async (token) => {
    try {
      const res = await axios.get(`${API}/system-logs/`, {
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

  deleteSystemLog: async (id, token) => {
    if (!token) throw new Error('Authorization token is missing');
    const res = await axios.delete(
      `${API}/system-logs/${id}/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },
};

export default SystemLogService;
