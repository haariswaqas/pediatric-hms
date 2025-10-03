import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';

const LabTestService = {

    // fecth all lab tests

    fetchLabTests: async(token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/lab-tests/`, {
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

    fetchLabTestById: async(labTestId, token) => {

        if (!token) throw new Error('Authorization token is missing');
        if (!labTestId) throw new Error('lab test ID is required');
        try {
            const res = await axios.get(`${API}/lab-tests/${labTestId}/`, {
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

    createLabTest: async(labTestData, token) => {

        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/lab-tests/`, labTestData, {
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

    bulkUploadLabTests: async (file, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/lab-tests/bulk-upload/`, file, {
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


    updateLabTest: async(labTestId, labTestData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!labTestId) throw new Error('Lab test ID is required');
        try {
            const res = await axios.patch(`${API}/lab-tests/${labTestId}/`, labTestData, {
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

    deleteLabTest: async(labTestId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!labTestId) throw new Error('lab test ID is required');
        try {
            const res = await axios.delete(`${API}/lab-tests/${labTestId}/`, {
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

export default LabTestService;