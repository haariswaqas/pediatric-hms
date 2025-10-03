import axios from "axios";
import API from "../api";
import { handleRequestError } from "../handleRequestError";

const AdmissionService = {

    fetchAdmissions: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/admission-records/`, {
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

  dischargeChild: async (admissionId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!admissionId) throw new Error('Admission ID is required');
    const res = await axios.post(`${API}/admission-records/${admissionId}/discharge/`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },


    searchAdmissions: async (query, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!query) throw new Error("Search query 'q' is required");
        try {
            const res = await axios.get(
                `${API}/admission-records/search/`,
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

    generateAdmissionReport: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        
        try {
            const res = await axios.post(
          `${API}/admission-records/send-admission-report/`,
          null,
          {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            withCredentials: true,
          }
        );
        console.log(res.data); 
        return res.data;
        
        } catch (err) {
          handleRequestError(err);
        }
      },

    fetchAdmissionById: async (admissionId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!admissionId) throw new Error('Admission ID is required');
        try {
            const res = await axios.get(`${API}/admission-records/${admissionId}/`, {
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

    createAdmission: async (admissionData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/admission-records/`, admissionData, {
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

updateAdmission: async (admissionId, updatedData, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!admissionId) throw new Error('Admission ID is required');
    try {
        const res = await axios.patch(`${API}/admission-records/${admissionId}/`, updatedData, {
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

    deleteAdmission: async (admissionId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!admissionId) throw new Error('Admission ID is required');
        try {
            const res = await axios.delete(`${API}/admission-records/${admissionId}/`, {
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

 export default AdmissionService;