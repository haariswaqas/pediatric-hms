// src/services/appointments/AppointmentService.jsx
import axios from 'axios';
import API from '../api/';
import { handleRequestError } from '../handleRequestError';
const AppointmentService = {
  // Fetch all appointments
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

  // Fetch one appointment by ID
  fetchAppointmentById: async (appointmentId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!appointmentId) throw new Error('Appointment ID is required');
    try {
      const res = await axios.get(`${API}/appointments/${appointmentId}/`, {
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

  // Create a new appointment
  createAppointment: async (appointmentData, token) => {
    if (!token) throw new Error('Authorization token is missing');
    try {
      const isFormData = appointmentData instanceof FormData;
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      const res = await axios.post(`${API}/appointments/`, appointmentData, {
        headers,
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // Update an existing appointment
  updateAppointment: async (appointmentId, updatedData, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!appointmentId) throw new Error('Appointment ID is required');
    try {
      const isFormData = updatedData instanceof FormData;
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      const res = await axios.put(
        `${API}/appointments/${appointmentId}/`,
        updatedData,
        {
          headers,
          withCredentials: true,
        }
      );
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // Delete an appointment
  deleteAppointment: async (appointmentId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!appointmentId) throw new Error('Appointment ID is required');
    try {
      const res = await axios.delete(`${API}/appointments/${appointmentId}/`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // these two  needed for when creating an appointment later on.. 
// so we will have to fetch the children ( who are the patient ) and the doctor

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

  fetchDoctors: async (token) => {
    if (!token) throw new Error('Authorization token is missing');
    try {
      const res = await axios.get(`${API}/admin/doctor-profiles/`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // for confirming and canceling appointments
  confirmAppointment: async (appointmentId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!appointmentId) throw new Error('Appointment ID is required');
    const res = await axios.post(`${API}/appointments/${appointmentId}/confirm/`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  
  cancelAppointment: async (appointmentId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!appointmentId) throw new Error('Appointment ID is required');
    const res = await axios.post(`${API}/appointments/${appointmentId}/cancel/`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  searchAppointments: async (query, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!query) throw new Error("Search query 'q' is required");
    try {
      const res = await axios.get(
        `${API}/appointments/search/`,
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

  autoCompleteAll: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
        const res = await axios.post(
            `${API}/appointments/auto_complete_all/`,
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

  generateAppointmentReport: async (token) => {
    if (!token) throw new Error('Authorization token is missing');
    
    try {const res = await axios.post(
      `${API}/appointments/send-daily-report/`,
      null,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        withCredentials: true,
      }
    );
    console.log(res.data);  // Log the response
    return res.data;
    
    } catch (err) {
      handleRequestError(err);
    }
  }

};





export default AppointmentService;
