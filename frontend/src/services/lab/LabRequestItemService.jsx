import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';

const LabRequestItemService = {

    fetchLabRequestItems: async(token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/lab-request-items/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                withCredentials: true,
            });
            return res.data;
        } catch (err) {
            handleRequestError(err);
        }
    },    


    fetchLabRequestItemById: async(labRequestItemId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!labRequestItemId) throw new Error('lab request item ID is required');
        try {
            const res = await axios.get(`${API}/lab-request-items/${labRequestItemId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                withCredentials: true,
            });
            return res.data;
        } catch (err) {
            handleRequestError(err);
        }
    },
    createLabRequestItem: async(labRequestItemData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/lab-request-items/`, labRequestItemData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                withCredentials: true,
            });
            return res.data;
        } catch (err) {
            handleRequestError(err);
        }
    },
    updateLabRequestItem: async(labRequestItemId, labRequestItemData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!labRequestItemId) throw new Error('Lab request item ID is required');
        try {
            const res = await axios.patch(`${API}/lab-request-items/${labRequestItemId}/`, labRequestItemData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                withCredentials: true,
            });
            return res.data;
        } catch (err) {
            handleRequestError(err);
        }

    },

    deleteLabRequestItem: async(labRequestItemId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!labRequestItemId) throw new Error('lab request item ID is required');
        try {
            const res = await axios.delete(`${API}/lab-request-items/${labRequestItemId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                withCredentials: true,
            });
            return res.data;
        } catch (err) {
            handleRequestError(err);
        }

    }

}

export default LabRequestItemService;