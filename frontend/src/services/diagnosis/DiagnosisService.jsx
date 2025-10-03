import axios from "axios";
import API from "../api";
import { handleRequestError } from "../handleRequestError";

const DiagnosisService = {
    // fetch all diagnoses
    fetchDiagnoses: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/diagnoses/`, {
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

    searchDiagnoses: async (query, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!query) throw new Error("Search query 'q' is required");
        try {
            const res = await axios.get(
                `${API}/diagnoses/search/`,
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


    // fetch one diagnosis by id
    fetchDiagnosisById: async (diagnosisId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!diagnosisId) throw new Error('Diagnosis ID is required');
        try {
            const res = await axios.get(`${API}/diagnoses/${diagnosisId}/`, {
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

    // create a new diagnosis
    createDiagnosis: async (diagnosisData, token) => {
        if (!token) throw new Error('Auth token missing');

        try {
            const res = await axios.post(`${API}/diagnoses/`, diagnosisData, {
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

    // update a diagnosis
    updateDiagnosis: async (diagnosisId, updatedData, token) => {
        if (!token) throw new Error('Auth token missing');

        try {
            const res = await axios.patch(`${API}/diagnoses/${diagnosisId}/`, updatedData, {
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

        // Change diagnosis status
        changeDiagnosisStatus: async (diagnosisId, statusAction, token) => {
            if (!token) throw new Error('Authorization token is missing');
            if (!diagnosisId) throw new Error('Diagnosis ID is required');
            if (!statusAction) throw new Error('Status action is required');
    
            try {
                const res = await axios.post(`${API}/diagnoses/${diagnosisId}/${statusAction}/`, null, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                    withCredentials: true,
                });
                return res.data;
            } catch (err) {
                DiagnosisService.handleRequestError(err);
            }
        },
    
        // Optional convenience wrappers
        markDiagnosisResolved: async (diagnosisId, token) => {
            return DiagnosisService.changeDiagnosisStatus(diagnosisId, 'mark_resolved', token);
        },
    
        markDiagnosisChronic: async (diagnosisId, token) => {
            return DiagnosisService.changeDiagnosisStatus(diagnosisId, 'mark_chronic', token);
        },
    
        markDiagnosisActive: async (diagnosisId, token) => {
            return DiagnosisService.changeDiagnosisStatus(diagnosisId, 'mark_active', token);
        },
    
        markDiagnosisRecurrent: async (diagnosisId, token) => {
            return DiagnosisService.changeDiagnosisStatus(diagnosisId, 'mark_recurrent', token);
        },
    
        markDiagnosisProvisional: async (diagnosisId, token) => {
            return DiagnosisService.changeDiagnosisStatus(diagnosisId, 'mark_provisional', token);
        },
    
        markDiagnosisRuleOut: async (diagnosisId, token) => {
            return DiagnosisService.changeDiagnosisStatus(diagnosisId, 'mark_rule_out', token);
        },
    

    // delete a diagnosis
    deleteDiagnosis: async (diagnosisId, token) => {
        if (!token) throw new Error('Auth token missing');

        try {
            const res = await axios.delete(`${API}/diagnoses/${diagnosisId}/`, {
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

    fetchChildren: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/children/`, {
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

    fetchAppointments: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/appointments/`, {
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

    // Add this method to DiagnosisService

searchICDCodes: async (query, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!query) throw new Error('Search query is required');

    try {
        const res = await axios.get(`${API}/icd/search/`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
            params: { q: query },
        });
        return res.data;
    } catch (err) {
        DiagnosisService.handleRequestError(err);
    }
},

    handleRequestError: (err) => {
        if (err.response) {
            const message =
                err.response.data?.detail ||
                err.response.data?.message ||
                JSON.stringify(err.response.data);
            throw new Error(`Server error: ${message}`);
        } else if (err.request) {
            throw new Error('No response from server');
        } else {
            throw new Error(`Request error: ${err.message}`);
        }
    }
}

export default DiagnosisService;
