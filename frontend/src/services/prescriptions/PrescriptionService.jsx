import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';

const PrescriptionService = {

    // fetch all prescriptions
    fetchPrescriptions: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/prescriptions/`, {
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

    // fetch one prescription by id
    fetchPrescriptionById: async (prescriptionId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!prescriptionId) throw new Error('Prescription ID is required');
        try {
            const res = await axios.get(`${API}/prescriptions/${prescriptionId}/`, {
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

    autoExpireAll: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
        const res = await axios.post(
            `${API}/prescriptions/auto_expire_all/`,
            null,
            {
              headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
              withCredentials: true,
            }
          );
          return res.data;
        } catch (err) {
          handleRequestError(err);
        }
      },

      autoCompleteAll: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
        const res = await axios.post(
            `${API}/prescriptions/auto_complete_all/`,
            null,
            {
              headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
              withCredentials: true,
            }
          );
          return res.data;
        } catch (err) {
          handleRequestError(err);
        }
      },
    // create a new prescription
    createPrescription: async (prescriptionData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/prescriptions/`, prescriptionData, {
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

    // update a prescription
    updatePrescription: async (prescriptionId, updatedData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!prescriptionId) throw new Error('Prescription ID is required');
        try {
            const res = await axios.patch(`${API}/prescriptions/${prescriptionId}/`, updatedData, {
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

    // delete a prescription
    deletePrescription: async (prescriptionId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!prescriptionId) throw new Error('Prescription ID is required');
        try {
            const res = await axios.delete(`${API}/prescriptions/${prescriptionId}/`, {
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

export default PrescriptionService;
