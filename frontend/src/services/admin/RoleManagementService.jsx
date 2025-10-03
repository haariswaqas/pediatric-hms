// src/services/admin/RoleManagementService.jsx
import axios from 'axios';
import API from '../api';

const RoleManagementService = {

    fetchRolePermissions: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        const res = await axios.get(
          `${API}/admin/role-permissions/`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        return res.data;
      },

      fetchModels: async (token) => {
        if (!token) throw new Error('Authorization token is missing');
        const res = await axios.get(
          `${API}/admin/view-models/`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        return res.data;
      },
    
      fetchRolePermissionById: async (rolePermissionId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!rolePermissionId) throw new Error('Role Permission ID is required');
    
        const res = await axios.get(
          `${API}/admin/role-permissions/${rolePermissionId}/`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        return res.data;
      },

      createRolePermission: async (rolePermissionData, token) => {
        if (!token) throw new Error('Authorization token is missing');

    const formData = new FormData();
    for (const key in rolePermissionData) {
      if (rolePermissionData[key] !== undefined && rolePermissionData[key] !== null) {
        formData.append(key, rolePermissionData[key]);
      }
    }

    const res = await axios.post(
      `${API}/admin/role-permissions/`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return res.data;
      }, 


      updateRolePermission: async (rolePermissionId, updatedData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!rolePermissionId) throw new Error('User ID is required');
    
        const formData = new FormData();
        for (const key in updatedData) {
          if (updatedData[key] !== undefined && updatedData[key] !== null) {
            formData.append(key, updatedData[key]);
          }
        }
    
        const res = await axios.patch(
          `${API}/admin/role-permissions/${rolePermissionId}/`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        return res.data;
      },

      deleteRolePermission: async (rolePermissionId, token) => {
        if (!token) throw new Error('Authorization token is missing');
        if (!rolePermissionId) throw new Error('role permission ID is required');
    
        const res = await axios.delete(
          `${API}/admin/role-permissions/${rolePermissionId}/`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        return res.data;
      },
};

export default RoleManagementService;