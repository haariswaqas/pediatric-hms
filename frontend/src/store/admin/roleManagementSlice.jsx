// src/store/admin/roleManagementManagementSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import RoleManagementService from '../../services/admin/RoleManagementService';


export const fetchRolePermissions = createAsyncThunk(
    'roleManagement/fetchRolePermissions',
    async (_, { getState, rejectWithValue }) => {
      try {
        const token = getState().auth.access;
        const response = await RoleManagementService.fetchRolePermissions(token);
        return response;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

export const fetchModels = createAsyncThunk(
    'roleManagement/fetchModels', 
    async(_, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access; 
            const response = await RoleManagementService.fetchModels(token);
            return response;

        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

  // Fetch a single user by ID
export const fetchRolePermissionById = createAsyncThunk(
    'roleManagement/fetchRolePermissionById',
    async (rolePermissionId, { getState, rejectWithValue }) => {
      try {
        const token = getState().auth.access;
        const response = await RoleManagementService.fetchRolePermissionById(rolePermissionId, token);
        return response;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

  export const createRolePermission = createAsyncThunk(
    'roleManagement/createRolePermission',
    async (rolePermissionData, { getState, rejectWithValue }) => {
      try {
        const token = getState().auth.access;
        const response = await RoleManagementService.createRolePermission(rolePermissionData, token);
        return response;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );
  
  export const updateRolePermission = createAsyncThunk(
    'roleManagement/updateRolePermission',
    async ({ rolePermissionId, updatedData }, { getState, rejectWithValue }) => {
      try {
        const token = getState().auth.access;
        const response = await RoleManagementService.updateRolePermission(rolePermissionId, updatedData, token);
        return response;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

  export const deleteRolePermission = createAsyncThunk(
    'roleManagement/deleteRolePermission',
    async (rolePermissionId, { getState, rejectWithValue }) => {
      try {
        const token = getState().auth.access;
        await RoleManagementService.deleteRolePermission(rolePermissionId, token);
        return rolePermissionId;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

const roleManagementSlice = createSlice({
  name: 'roleManagement',
  initialState:  {
    rolePermissions: [],
    models: [],
    selectedRolePermission: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedRolePermission(state) {
      state.selectedRolePermission = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all role permissions
      .addCase(fetchRolePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.rolePermissions = action.payload;
      })
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch available models (ContentTypes)
      .addCase(fetchModels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.loading = false;
        state.models = action.payload;
      })
      .addCase(fetchModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch a single role permission
      .addCase(fetchRolePermissionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRolePermissionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRolePermission = action.payload;
      })
      .addCase(fetchRolePermissionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create role permission
      .addCase(createRolePermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRolePermission.fulfilled, (state, action) => {
        state.loading = false;
        state.rolePermissions.push(action.payload);
      })
      .addCase(createRolePermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update role permission
      .addCase(updateRolePermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRolePermission.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.rolePermissions.findIndex(
          (perm) => perm.id === action.payload.id
        );
        if (index !== -1) {
          state.rolePermissions[index] = action.payload;
        }
      })
      .addCase(updateRolePermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete role permission
      .addCase(deleteRolePermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRolePermission.fulfilled, (state, action) => {
        state.loading = false;
        state.rolePermissions = state.rolePermissions.filter(
          (perm) => perm.id !== action.payload
        );
      })
      .addCase(deleteRolePermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedRolePermission, clearError } = roleManagementSlice.actions;

export default roleManagementSlice.reducer;