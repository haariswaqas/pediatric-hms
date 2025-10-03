// src/services/BillItemService.js
import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';

const BillItemService = {
    // fetch all bill items
    fetchBillItems: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/bill-items/`, {
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

    // fetch one bill item by id
    fetchBillItemById: async (billItemId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!billItemId) throw new Error('Bill Item ID is required');
        try {
            const res = await axios.get(`${API}/bill-items/${billItemId}/`, {
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

    // create a new bill item
    createBillItem: async (billItemData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/bill-items/`, billItemData, {
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

    // update a bill item
    updateBillItem: async (billItemId, updatedData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!billItemId) throw new Error('Bill Item ID is required');
        try {
            const res = await axios.patch(`${API}/bill-items/${billItemId}/`, updatedData, {
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

    // delete a bill item
    deleteBillItem: async (billItemId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!billItemId) throw new Error('Bill Item ID is required');
        try {
            const res = await axios.delete(`${API}/bill-items/${billItemId}/`, {
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

export default BillItemService;
