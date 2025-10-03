import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';

const BillService = {

    // fetch all bills
    fetchBills: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/bills/`, {
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

    // fetch one bill by id
    fetchBillById: async (billId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!billId) throw new Error('Bill ID is required');
        try {
            const res = await axios.get(`${API}/bills/${billId}/`, {
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


    // create a new bill
    createBill: async (billData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/bills/`, billData, {
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

    // update a bill
    updateBill: async (billId, updatedData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!billId) throw new Error('Bill ID is required');
        try {
            const res = await axios.patch(`${API}/bills/${billId}/`, updatedData, {
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

    // delete a bill
    deleteBill: async (billId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!billId) throw new Error('Bill ID is required');
        try {
            const res = await axios.delete(`${API}/bills/${billId}/`, {
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

export default BillService;
