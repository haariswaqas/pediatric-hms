import axios from "axios";
import API from "../api";
import { handleRequestError } from "../handleRequestError";

const TreatmentService = {
    // fetch all treatments
    fetchTreatments: async (token) => {
        if (!token) throw new Error('Auth token missing');
        try {
            const res = await axios.get(`${API}/treatments/`, {
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

    // fetch one treatment by id
    fetchTreatmentById: async (treatmentId, token) => {
        if (!token) throw new Error('Auth token missing');
        if (!treatmentId) throw new Error('Treatment ID is required');
        try {
            const res = await axios.get(`${API}/treatments/${treatmentId}/`, {
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

    // create a new treatment
    createTreatment: async (treatmentData, token) => {
        if (!token) throw new Error('Auth token missing');
        try {
            const res = await axios.post(`${API}/treatments/`, treatmentData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            return res.data;
        } catch (err) {
            handleRequestError(err);
        }
    },

    // update a treatment
    updateTreatment: async (treatmentId, updatedData, token) => {
        if (!token) throw new Error('Auth token missing');
        if (!treatmentId) throw new Error('Treatment ID is required');
        try {
            const res = await axios.patch(`${API}/treatments/${treatmentId}/`, updatedData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            return res.data;
        } catch (err) {
            handleRequestError(err);
        }
    },

    // delete a treatment
    deleteTreatment: async (treatmentId, token) => {
        if (!token) throw new Error('Auth token missing');
        if (!treatmentId) throw new Error('Treatment ID is required');
        try {
            const res = await axios.delete(`${API}/treatments/${treatmentId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
            return res.data;
        } catch (err) {
            handleRequestError(err);
        }
    },
}
export default TreatmentService;