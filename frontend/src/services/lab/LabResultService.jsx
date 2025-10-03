import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';

const LabResultService = {

    // fecth all lab requests

    fetchLabResults: async(token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/lab-results/`, {
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

    fetchLabResultById: async(labResultId, token) => {

        if (!token) throw new Error('Authorization token is missing');
        if (!labResultId) throw new Error('lab result ID is required');
        try {
            const res = await axios.get(`${API}/lab-results/${labResultId}/`, {
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

    createLabResult: async(labResultData, token) => {

        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/lab-results/`, labResultData, {
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



    updateLabResult: async(labResultId, labResultData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!labResultId) throw new Error('Lab result ID is required');
        try {
            const res = await axios.patch(`${API}/lab-results/${labResultId}/`, labResultData, {
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

    deleteLabResult: async(labResultId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!labResultId) throw new Error('lab result ID is required');
        try {
            const res = await axios.delete(`${API}/lab-results/${labResultId}/`, {
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

export default LabResultService;