import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';

const ReferenceRangeService = {

    // fetch all reference ranges
    fetchReferenceRanges: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/reference-ranges/`, {
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

    fetchReferenceRangeById: async (referenceRangeId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!referenceRangeId) throw new Error('Reference range ID is required');
        try {
            const res = await axios.get(`${API}/reference-ranges/${referenceRangeId}/`, {
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

    createReferenceRange: async (referenceRangeData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/reference-ranges/`, referenceRangeData, {
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

    bulkUploadReferenceRanges: async (file, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/reference-ranges/bulk-upload/`, file, {
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


    updateReferenceRange: async (referenceRangeId, referenceRangeData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!referenceRangeId) throw new Error('Reference range ID is required');
        try {
            const res = await axios.patch(`${API}/reference-ranges/${referenceRangeId}/`, referenceRangeData, {
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

    deleteReferenceRange: async (referenceRangeId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!referenceRangeId) throw new Error('Reference range ID is required');
        try {
            const res = await axios.delete(`${API}/reference-ranges/${referenceRangeId}/`, {
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

export default ReferenceRangeService;
