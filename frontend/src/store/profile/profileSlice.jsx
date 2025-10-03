// src/store/profile/profileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProfileService from '../../services/ProfileService';

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.access; // Get token from Redux state
      const role = state.auth.user?.role; // Get user role from Redux state
      
      if (!role) {
        return rejectWithValue('User role is missing');
      }
      
      const response = await ProfileService.fetchProfile(role, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (updatedData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.access;
      const role = state.auth.user?.role;

      if (!role) {
        return rejectWithValue('User role is missing');
      }

      const response = await ProfileService.updateProfile(role, updatedData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const deleteProfile = createAsyncThunk(
  'profile/deleteProfile',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.access;
      const role = state.auth.user?.role;
      
      if (!role || !userId) {
        return rejectWithValue('User role or ID is missing');
      }
      
      const response = await ProfileService.deleteProfile(userId, role, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  profile: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchProfile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle deleteProfile
      .addCase(deleteProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, (state) => {
        state.loading = false;
        state.profile = null;
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;