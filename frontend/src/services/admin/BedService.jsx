import axios from 'axios';
import API from '../api/';
import { handleRequestError } from '../handleRequestError';

const BedService = {
    fetchBeds: async (token) => {
        try {
            const res = await axios.get(`${API}/beds/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                withCredentials: true,
            });
            return res.data;
        } catch (err) {
            handleRequestError(err);
        }
    },

    fetchBedById: async (bedId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!bedId) throw new Error('Bed ID is required');

        const res = await axios.get(
            `${API}/beds/${bedId}/`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return res.data;
    },

    createBed: async (bedData, token) => {
        if (!token) throw new Error('Auth token missing');

        try {
            const res = await axios.post(
                `${API}/beds/`,
                bedData,
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
            handleRequestError(err);
        }
    },

    updateBed: async (bedId, updatedData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!bedId) throw new Error('Bed ID is required');

        const formData = new FormData();
        for (const key in updatedData) {
            if (updatedData[key] !== undefined && updatedData[key] !== null) {
                formData.append(key, updatedData[key]);
            }
        }

        const res = await axios.put(
            `${API}/beds/${bedId}/`,
            formData,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return res.data;
    },

    deleteBed: async (bedId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!bedId) throw new Error('Bed ID is required');

        const res = await axios.delete(
            `${API}/beds/${bedId}/`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return res.data;
    },
}

export default BedService;
