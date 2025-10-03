import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';

const DrugDispenseService = {

    // fetch all drug dispenses
    fetchDrugDispenses: async(token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/drug-dispense/`, {
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

    // fetch a drug dispense record by id
    fetchDrugDispenseById: async(drugDispenseId, token) => {

        if (!token) throw new Error('Authorization token is missing');
        if (!drugDispenseId) throw new Error('Drug dispense ID is required');
        try {
            const res = await axios.get(`${API}/drug-dispense/${drugDispenseId}/`, {
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

    // create a new drug dispense record
    createDrugDispense: async(drugDispenseData, token) => {

        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/drug-dispense/`, drugDispenseData, {
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

    updateDrugDispense: async(drugDispenseId, drugDispenseData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!drugDispenseId) throw new Error('Drug dispense ID is required');
        try {
            const res = await axios.patch(`${API}/drug-dispense/${drugDispenseId}/`, drugDispenseData, {
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

    deleteDrugDispense: async(drugDispenseId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!drugDispenseId) throw new Error('Drug dispense ID is required');
        try {
            const res = await axios.delete(`${API}/drug-dispense/${drugDispenseId}/`, {
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

export default DrugDispenseService;