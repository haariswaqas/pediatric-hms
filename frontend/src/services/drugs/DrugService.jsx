import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';
const DrugService = {

    // fetch all drugs
    fetchDrugs: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/drugs/`, {
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

    bulkUploadDrugs: async (file, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/drugs/bulk-upload/`, file, {
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

    // fetch one drug by id
    fetchDrugById: async (drugId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!drugId) throw new Error('Drug ID is required');
        try {
            const res = await axios.get(`${API}/drugs/${drugId}/`, {
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

    // create a new drug
    createDrug: async (drugData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/drugs/`, drugData, {
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

    // update a drug
    updateDrug: async (drugId, updatedData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!drugId) throw new Error('Drug ID is required');
        try {
            const res = await axios.patch(`${API}/drugs/${drugId}/`, updatedData, {
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

    searchDrugs: async (query, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!query) throw new Error("Search query 'q' is required");
        try {
          const res = await axios.get(
            `${API}/drugs/search/`,
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
    

    // delete a drug
    deleteDrug: async (drugId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!drugId) throw new Error('Drug ID is required');
        try {
            const res = await axios.delete(`${API}/drugs/${drugId}/`, {
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

export default DrugService;

