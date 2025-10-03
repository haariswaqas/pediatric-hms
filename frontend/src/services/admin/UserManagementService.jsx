// src/services/admin/UserManagementService.jsx
import axios from 'axios';
import API from '../api';

const UserManagementService = {
  /**
   * Fetch all users.
   * @param {string} token - JWT access token.
   */
  fetchUsers: async (token) => {
    if (!token) throw new Error('Authorization token is missing');
    const res = await axios.get(
      `${API}/admin/users/`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return res.data;
  },

  /**
   * Fetch a single user by ID.
   * @param {number|string} userId
   * @param {string} token
   */
  fetchUserById: async (userId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!userId) throw new Error('User ID is required');

    const res = await axios.get(
      `${API}/admin/users/${userId}/`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return res.data;
  },

  /**
   * Create a new user.
   * @param {Object} userData - { username, email, password, password2, role, license_document? }
   * @param {string} token
   */
  createUser: async (userData, token) => {
    if (!token) throw new Error('Authorization token is missing');

    const formData = new FormData();
    for (const key in userData) {
      if (userData[key] !== undefined && userData[key] !== null) {
        formData.append(key, userData[key]);
      }
    }

    const res = await axios.post(
      `${API}/admin/users/`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return res.data;
  },

  /**
   * Update an existing user.
   * @param {number|string} userId
   * @param {Object} updatedData
   * @param {string} token
   */
  updateUser: async (userId, updatedData, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!userId) throw new Error('User ID is required');

    const formData = new FormData();
    for (const key in updatedData) {
      if (updatedData[key] !== undefined && updatedData[key] !== null) {
        formData.append(key, updatedData[key]);
      }
    }

    const res = await axios.put(
      `${API}/admin/users/${userId}/`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return res.data;
  },

  /**
   * Delete a user by ID.
   * @param {number|string} userId
   * @param {string} token
   */
  deleteUser: async (userId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!userId) throw new Error('User ID is required');

    const res = await axios.delete(
      `${API}/admin/users/${userId}/`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return res.data;
  },

   // Deactivate a user
   deactivateUser: async (userId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!userId) throw new Error('User ID is required');
    const res = await axios.post(`${API}/admin/users/${userId}/deactivate/`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // Activate a user
  activateUser: async (userId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!userId) throw new Error('User ID is required');
    const res = await axios.post(`${API}/admin/users/${userId}/activate/`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }, 

    /**
   * Manually verify a medical professional.
   * @param {number|string} userId
   * @param {string} token
   */
    manuallyVerifyMedicalProfessional: async (userId, token) => {
      if (!token) throw new Error('Authorization token is missing');
      if (!userId) throw new Error('User ID is required');
  
      const res = await axios.post(
        `${API}/admin/users/${userId}/manual_verify_medical_professional/`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return res.data;
    },
  
      /**
   * Search users by username.
   * @param {string} query - The search keyword.
   * @param {string} token - JWT access token.
   */
  searchUsers: async (query, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!query) throw new Error('Search query is required');

    const res = await axios.get(
      `${API}/search/users/`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: query }
      }
    );
    return res.data;
  },


  
};

export default UserManagementService;
