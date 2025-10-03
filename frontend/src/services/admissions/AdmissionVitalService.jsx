import axios from "axios";
import API from "../api";
import { handleRequestError } from "../handleRequestError";

const AdmissionVitalService = {

    fetchAdmissionVitals: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/admission-vital-records/`, {
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

    fetchAdmissionVitalById: async (admissionVitalId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!admissionVitalId) throw new Error('Admission Vital ID is required');
        try {
            const res = await axios.get(`${API}/admission-vital-records/${admissionVitalId}/`, {
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

    createAdmissionVital: async (admissionVitalData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/admission-vital-records/`, admissionVitalData, {
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

updateAdmissionVital: async (admissionVitalId, updatedData, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!admissionVitalId) throw new Error('Admission Vital ID is required');
    try {
        const res = await axios.patch(`${API}/admission-vital-records/${admissionVitalId}/`, updatedData, {
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

    deleteAdmissionVital: async (admissionVitalId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!admissionVitalId) throw new Error('Admission Vital ID is required');
        try {
            const res = await axios.delete(`${API}/admission-vital-records/${admissionVitalId}/`, {
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
    
    
    fetchVitalHistories: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/admission-vital-history/`, {
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

    fetchVitalHistoryById: async (vitalHistoryId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!vitalHistoryId) throw new Error('Vital History ID is required');
        try {
            const res = await axios.get(`${API}/admission-vital-history/${admissionVitalId}/`, {
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

 export default AdmissionVitalService;