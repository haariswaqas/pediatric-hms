// src/services/shift/ShiftAssignmentService.js
import axios from 'axios';
import API from '../api';

// Generic CRUD service for shift assignments by role
const makeService = (basePath) => ({
  fetchAll: async (token) => {
    const res = await axios.get(
      `${API}/${basePath}/`,
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    );
    return res.data;
  },
  fetchById: async (id, token) => {
    const res = await axios.get(
      `${API}/${basePath}/${id}/`,
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    );
    return res.data;
  },
  create: async (data, token) => {
    const res = await axios.post(
      `${API}/${basePath}/`,
      data,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    return res.data;
  },
  update: async (id, data, token) => {
    const res = await axios.patch(
      `${API}/${basePath}/${id}/`,
      data,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    return res.data;
  },
  delete: async (id, token) => {
    const res = await axios.delete(
      `${API}/${basePath}/${id}/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  }
});

export const DoctorShiftAssignmentService = makeService('doctor-shift-assignments');
export const NurseShiftAssignmentService = makeService('nurse-shift-assignments');
export const PharmacistShiftAssignmentService = makeService('pharmacist-shift-assignments');
export const LabTechShiftAssignmentService = makeService('labtech-shift-assignments');