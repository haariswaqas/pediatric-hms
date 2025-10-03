import axios from 'axios';
import API from './api';

const ProfileService = {
  /**
   * Fetch the current user’s profile for their role.
   *
   * @param {string} role  — e.g. 'parent', 'doctor', etc.
   * @param {string} token — JWT access token
   */
  fetchProfile: async (role, token) => {
    if (!role) throw new Error('User role is missing');
    if (!token) throw new Error('Authorization token is missing');

    const res = await axios.get(
      `${API}/${role}/profile/`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return res.data;
  },

  /**
   * Update the current user’s profile for their role.
   * (PUT to the same endpoint, no ID in URL.)
   *
   * @param {string} role
   * @param {FormData} updatedData
   * @param {string} token
   */
  updateProfile: async (role, updatedData, token) => {
    if (!role) throw new Error('User role is missing');
    if (!token) throw new Error('Authorization token is missing');

    // When sending FormData, axios will set the correct Content-Type boundary
    const res = await axios.put(
      `${API}/${role}/profile/`,
      updatedData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return res.data;
  }
};

export default ProfileService;
