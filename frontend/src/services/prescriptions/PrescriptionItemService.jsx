import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';

const PrescriptionItemService = {

    // fetch all prescription items
    fetchPrescriptionItems: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/prescription-items/`, {
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

    // fetch one prescription item by ID
    fetchPrescriptionItemById: async (prescriptionItemId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!prescriptionItemId) throw new Error('Prescription Item ID is required');
        try {
            const res = await axios.get(`${API}/prescription-items/${prescriptionItemId}/`, {
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

    // search prescription items
    searchPrescriptionItems: async (query, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!query) throw new Error("Search query 'q' is required");
        try {
            const res = await axios.get(
                `${API}/prescription-items/search/`,
                {
                    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                    params: { q: query },
                    withCredentials: true,
                }
            );
            return res.data;
        } catch (err) {
            handleRequestError(err);
        }
    },


    // create a new prescription item
    createPrescriptionItem: async (prescriptionItemData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/prescription-items/`, prescriptionItemData, {
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

    // update a prescription item
    updatePrescriptionItem: async (prescriptionItemId, prescriptionItemData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!prescriptionItemId) throw new Error('Prescription Item ID is required');
        try {
            const res = await axios.patch(`${API}/prescription-items/${prescriptionItemId}/`, prescriptionItemData, {
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

    // delete a prescription item
    deletePrescriptionItem: async (prescriptionItemId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!prescriptionItemId) throw new Error('Prescription Item ID is required');
        try {
            const res = await axios.delete(`${API}/prescription-items/${prescriptionItemId}/`, {
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

};

export default PrescriptionItemService;
