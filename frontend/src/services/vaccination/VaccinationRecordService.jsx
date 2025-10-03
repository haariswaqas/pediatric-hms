import axios from 'axios';
import API from '../api/';

const VaccinationRecordService = {

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
  },

  
  fetchVaccinationRecords: async (token) => {
    try {
      const res = await axios.get(`${API}/vaccination-records/`, {
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

  fetchVaccinationRecordById: async (vaccinationRecordId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!vaccinationRecordId) throw new Error('Record ID is required');

    try {
      const res = await axios.get(`${API}/vaccination-records/${vaccinationRecordId}/`, {
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

  createVaccinationRecord: async (vaccinationRecordData, token) => {
    if (!token) throw new Error('Auth token missing');

    try {
      const res = await axios.post(`${API}/vaccination-records/`, vaccinationRecordData, {
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

  updateVaccinationRecord: async (vaccinationRecordId, updatedData, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!vaccinationRecordId) throw new Error('Record ID is required');

    const formData = new FormData();
    for (const key in updatedData) {
      if (updatedData[key] !== undefined && updatedData[key] !== null) {
        formData.append(key, updatedData[key]);
      }
    }

    try {
      const res = await axios.put(`${API}/vaccination-records/${vaccinationRecordId}/`, formData, {
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

  deleteVaccinationRecord: async (vaccinationRecordId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!vaccinationRecordId) throw new Error('Record ID is required');

    try {
      const res = await axios.delete(`${API}/vaccination-records/${vaccinationRecordId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },
};

// Helper function for consistent error handling
function handleRequestError(err) {
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

export default VaccinationRecordService;
