// src/store/admin/profileManagementSlice.jsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProfileManagementService from '../../services/admin/ProfileManagementService';

// Fetch all profiles
export const fetchProfiles = createAsyncThunk(
  'profileManagement/fetchProfiles',
  async ({ role }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await ProfileManagementService.fetchProfiles(role, token);
      return { role, data: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch a single profile by ID
export const fetchProfileById = createAsyncThunk(
  'profileManagement/fetchProfileById',
  async ({ role, profileId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await ProfileManagementService.fetchProfileById(role, profileId, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create a new profile
export const createProfile = createAsyncThunk(
  'profileManagement/createProfile',
  async ({ role, profileData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await ProfileManagementService.createProfile(role, profileData, token);
      return { role, profile: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update an existing profile
export const updateProfile = createAsyncThunk(
  'profileManagement/updateProfile',
  async ({ role, profileId, updatedData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await ProfileManagementService.updateProfile(role, profileId, updatedData, token);
      return { role, profile: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a profile
export const deleteProfile = createAsyncThunk(
  'profileManagement/deleteProfile',
  async ({ role, profileId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      await ProfileManagementService.deleteProfile(role, profileId, token);
      return { role, profileId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Search profiles by keyword
export const searchProfiles = createAsyncThunk(
  'profileManagement/searchProfiles',
  async ({ role, query }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await ProfileManagementService.searchProfiles(role, query, token);
      return { role, data: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const profileManagementSlice = createSlice({
  name: 'profileManagement',
  initialState: {
    profilesByRole: {
      doctor: [],
      nurse: [],
      pharmacist: [],
      labtech: [],
      parent: []
    },
    selectedProfile: null,
    loading: false,
    error: null,
    searchResults: [],
  },
  reducers: {
    clearSelectedProfile: (state) => {
      state.selectedProfile = null;
      state.error = null;
    },
    clearProfileSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.loading = false;
        const { role, data } = action.payload;
        state.profilesByRole[role] = data;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchProfileById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProfile = action.payload;
      })
      .addCase(fetchProfileById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.loading = false;
        const { role, profile } = action.payload;
        state.profilesByRole[role].push(profile);
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        const { role, profile } = action.payload;
        const index = state.profilesByRole[role].findIndex(p => p.id === profile.id);
        if (index !== -1) {
          state.profilesByRole[role][index] = profile;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, (state, action) => {
        state.loading = false;
        const { role, profileId } = action.payload;
        state.profilesByRole[role] = state.profilesByRole[role].filter(profile => profile.id !== profileId);
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(searchProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data;
      })
      .addCase(searchProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedProfile, clearProfileSearchResults } = profileManagementSlice.actions;
export default profileManagementSlice.reducer;