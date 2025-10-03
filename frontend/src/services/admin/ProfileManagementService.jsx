// src/services/admin/ProfileManagementService.js
import axios from 'axios';
import API from '../api';

const ProfileManagementService = {
  /**
   * Fetch profiles based on the role.
   * @param {string} role - Role type (e.g., 'doctor', 'patient').
   * @param {string} token - JWT access token.
   */
   fetchProfiles: async (role, token) => {
    try {
      console.log('Fetching profiles for role:', role);
      const res = await axios.get(`${API}/admin/${role}-profiles/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched profiles:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }
  },
  

  /**
   * Fetch a single profile by ID based on the role.
   * @param {string} role - Role type.
   * @param {number|string} profileId - Profile ID.
   * @param {string} token - JWT access token.
   */
  fetchProfileById: async (role, profileId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!role) throw new Error('Role is required');
    if (!profileId) throw new Error('Profile ID is required');

    const res = await axios.get(`${API}/admin/${role}-profiles/${profileId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * Create a new profile based on the role.
   * @param {string} role - Role type.
   * @param {Object} profileData - Profile data object.
   * @param {string} token - JWT access token.
   */
  createProfile: async (role, profileData, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!role) throw new Error('Role is required');

    const formData = new FormData();
    for (const key in profileData) {
      if (profileData[key] !== undefined && profileData[key] !== null) {
        formData.append(key, profileData[key]);
      }
    }

    const res = await axios.post(`${API}/admin/${role}-profiles/`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * Update an existing profile based on the role.
   * @param {string} role - Role type.
   * @param {number|string} profileId - Profile ID.
   * @param {Object} updatedData - Updated profile data.
   * @param {string} token - JWT access token.
   */
  updateProfile: async (role, profileId, updatedData, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!role) throw new Error('Role is required');
    if (!profileId) throw new Error('Profile ID is required');

    const formData = new FormData();
    for (const key in updatedData) {
      if (updatedData[key] !== undefined && updatedData[key] !== null) {
        formData.append(key, updatedData[key]);
      }
    }

    const res = await axios.put(`${API}/admin/${role}-profiles/${profileId}/`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * Delete a profile based on the role.
   * @param {string} role - Role type.
   * @param {number|string} profileId - Profile ID.
   * @param {string} token - JWT access token.
   */
  deleteProfile: async (role, profileId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!role) throw new Error('Role is required');
    if (!profileId) throw new Error('Profile ID is required');

    const res = await axios.delete(`${API}/admin/${role}-profiles/${profileId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * Search profiles based on the role and query.
   * @param {string} role - Role type.
   * @param {string} query - Search query string.
   * @param {string} token - JWT access token.
   */
  searchProfiles: async (role, query, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!role) throw new Error('Role is required');
    if (!query) throw new Error('Search query is required');

    const res = await axios.get(`${API}/admin/${role}-profiles/search/`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { query }
    });
    return res.data;
  }
};

export default ProfileManagementService;
