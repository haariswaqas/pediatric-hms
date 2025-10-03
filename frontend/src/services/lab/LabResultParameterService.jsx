import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';

const LabResultParameterService = {

    // fecth all lab requests

    fetchLabResultParameters: async(token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/lab-result-parameters/`, {
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

    fetchLabResultParameterById: async(labResultParameterId, token) => {

        if (!token) throw new Error('Authorization token is missing');
        if (!labResultParameterId) throw new Error('lab result parameter ID is required');
        try {
            const res = await axios.get(`${API}/lab-result-parameters/${labResultParameterId}/`, {
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

    createLabResultParameter: async(labResultParameterData, token) => {

        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/lab-result-parameters/`, labResultParameterData, {
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



    updateLabResultParameter: async(labResultParameterId, labResultParameterData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!labResultParameterId) throw new Error('Lab result parameter ID is required');
        try {
            const res = await axios.patch(`${API}/lab-result-parameters/${labResultParameterId}/`, labResultParameterData, {
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

    deleteLabResultParameter: async(labResultParameterId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!labResultParameterId) throw new Error('lab result parameter ID is required');
        try {
            const res = await axios.delete(`${API}/lab-result-parameters/${labResultParameterId}/`, {
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

export default LabResultParameterService;