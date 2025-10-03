import axios from 'axios';
import API from '../api/';

const WardService = {
    fetchWards: async (token) => {
        try {
            const res = await axios.get(`${API}/wards/`, {
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

    fetchWardById: async (wardId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!wardId) throw new Error('Ward ID is required');
    
        const res = await axios.get(
          `${API}/wards/${wardId}/`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        return res.data;
    },
    
    createWard: async (wardData, token) => {
        if (!token) throw new Error('Auth token missing');
        
        try {
            const res = await axios.post(
                `${API}/wards/`,
                wardData,
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

    updateWard: async (wardId, updatedData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!wardId) throw new Error('Ward ID is required');
    
        const formData = new FormData();
        for (const key in updatedData) {
          if (updatedData[key] !== undefined && updatedData[key] !== null) {
            formData.append(key, updatedData[key]);
          }
        }
    
        const res = await axios.put(
          `${API}/wards/${wardId}/`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        return res.data;
    },

    deleteWard: async (wardId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!wardId) throw new Error('Ward ID is required');
    
        const res = await axios.delete(
          `${API}/wards/${wardId}/`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        return res.data;
    },
}

export default WardService;
