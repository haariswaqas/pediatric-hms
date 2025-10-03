import axios from 'axios';
import API from '../api/';
import { handleRequestError } from '../handleRequestError';

const VaccineService = {
  fetchVaccines: async (token) => {
    try {
      const res = await axios.get(`${API}/vaccines/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  fetchVaccineById: async (vaccineId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!vaccineId) throw new Error('Vaccine ID is required');

    const res = await axios.get(`${API}/vaccines/${vaccineId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  createVaccine: async (vaccineData, token) => {
    if (!token) throw new Error('Auth token missing');

    try {
      const res = await axios.post(`${API}/vaccines/`, vaccineData, {
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

  updateVaccine: async (vaccineId, updatedData, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!vaccineId) throw new Error('Vaccine ID is required');

    const formData = new FormData();
    for (const key in updatedData) {
      if (updatedData[key] !== undefined && updatedData[key] !== null) {
        formData.append(key, updatedData[key]);
      }
    }

    const res = await axios.put(`${API}/vaccines/${vaccineId}/`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  deleteVaccine: async (vaccineId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!vaccineId) throw new Error('Vaccine ID is required');

    const res = await axios.delete(`${API}/vaccines/${vaccineId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};



export default VaccineService;
