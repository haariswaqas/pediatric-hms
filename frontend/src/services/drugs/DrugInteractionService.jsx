import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';

const DrugInteractionService = {
    // fetch all drug interactions
    fetchDrugInteractions: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/drug-interactions/`, {
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

    // fetch one drug interaction by id
    fetchDrugInteractionById: async (drugInteractionId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!drugInteractionId) throw new Error('Drug interaction ID is required');
        try {
            const res = await axios.get(`${API}/drug-interactions/${drugInteractionId}/`, {
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

    // create a new drug interaction
    createDrugInteraction: async (drugInteractionData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/drug-interactions/`, drugInteractionData, {
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

    updateDrugInteraction: async (drugInteractionId, drugInteractionData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!drugInteractionId) throw new Error('Drug interaction ID is required');
        try {
            const res = await axios.put(`${API}/drug-interactions/${drugInteractionId}/`, drugInteractionData, {
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

    deleteDrugInteraction: async (drugInteractionId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!drugInteractionId) throw new Error('Drug interaction ID is required');
        try {
            const res = await axios.delete(`${API}/drug-interactions/${drugInteractionId}/`, {
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
}

export default DrugInteractionService;