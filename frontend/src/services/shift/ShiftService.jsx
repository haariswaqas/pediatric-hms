import axios from 'axios';
import API from '../api/';

const ShiftService = {
    fetchShifts: async (token) => {
        try {
            const res = await axios.get(`${API}/shifts/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                withCredentials: true,
            })
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

    fetchShiftById: async (shiftId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!shiftId) throw new Error('Shift ID is required');
    
        const res = await axios.get(
          `${API}/shifts/${shiftId}/`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        return res.data;
      },
    
    
    createShift: async (shiftData, token) => {
        if (!token) throw new Error('Auth token missing');
        
        try {
            // Use direct JSON instead of FormData since your API expects JSON
            const res = await axios.post(
                `${API}/shifts/`,
                shiftData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
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

    updateShift: async (shiftId, updatedData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!shiftId) throw new Error('Shift ID is required');
    
        const formData = new FormData();
        for (const key in updatedData) {
          if (updatedData[key] !== undefined && updatedData[key] !== null) {
            formData.append(key, updatedData[key]);
          }
        }
    
        const res = await axios.put(
          `${API}/shifts/${shiftId}/`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        return res.data;
      },
      deleteShift: async (shiftId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!shiftId) throw new Error('Shift ID is required');
    
        const res = await axios.delete(
          `${API}/shifts/${shiftId}/`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        return res.data;
      },
    

}

export default ShiftService;