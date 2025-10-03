import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';

const LabRequestService = {

    // fecth all lab requests

    fetchLabRequests: async(token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/lab-requests/`, {
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

    fetchLabRequestById: async(labRequestId, token) => {

        if (!token) throw new Error('Authorization token is missing');
        if (!labRequestId) throw new Error('lab test ID is required');
        try {
            const res = await axios.get(`${API}/lab-requests/${labRequestId}/`, {
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

    createLabRequest: async(labRequestData, token) => {

        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/lab-requests/`, labRequestData, {
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



    updateLabRequest: async(labRequestId, labRequestData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!labRequestId) throw new Error('Lab test ID is required');
        try {
            const res = await axios.patch(`${API}/lab-requests/${labRequestId}/`, labRequestData, {
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

    deleteLabRequest: async(labRequestId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!labRequestId) throw new Error('lab test ID is required');
        try {
            const res = await axios.delete(`${API}/lab-requests/${labRequestId}/`, {
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

export default LabRequestService;