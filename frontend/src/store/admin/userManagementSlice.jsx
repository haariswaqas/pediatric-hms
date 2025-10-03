// src/store/admin/userManagementSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import UserManagementService from '../../services/admin/UserManagementService';

// Fetch all users
export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await UserManagementService.fetchUsers(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch a single user by ID
export const fetchUserById = createAsyncThunk(
  'userManagement/fetchUserById',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await UserManagementService.fetchUserById(userId, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create a new user
export const createUser = createAsyncThunk(
  'userManagement/createUser',
  async (userData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await UserManagementService.createUser(userData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update an existing user
export const updateUser = createAsyncThunk(
  'userManagement/updateUser',
  async ({ userId, updatedData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await UserManagementService.updateUser(userId, updatedData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a user
export const deleteUser = createAsyncThunk(
  'userManagement/deleteUser',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      await UserManagementService.deleteUser(userId, token);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Activate a user
export const activateUser = createAsyncThunk(
  'userManagement/activateUser',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await UserManagementService.activateUser(userId, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Deactivate a user
export const deactivateUser = createAsyncThunk(
  'userManagement/deactivateUser',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await UserManagementService.deactivateUser(userId, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Manually Verify Medical Professional
export const manuallyVerifyMedicalProfessional = createAsyncThunk(
  'userManagement/manuallyVerifyMedicalProfessional',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await UserManagementService.manuallyVerifyMedicalProfessional(id, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Search users by username
export const searchUsers = createAsyncThunk(
  'userManagement/searchUsers',
  async (query, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await UserManagementService.searchUsers(query, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState: {
    users: [],
    selectedUser: null,
    loading: false,
    error: null,
    searchResults: [], // To hold search results
  },
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(activateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(activateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deactivateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(manuallyVerifyMedicalProfessional.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(manuallyVerifyMedicalProfessional.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(manuallyVerifyMedicalProfessional.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedUser, clearSearchResults } = userManagementSlice.actions;
export default userManagementSlice.reducer;
