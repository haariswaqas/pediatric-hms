// src/store/shifts/doctorShiftAssignmentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DoctorShiftAssignmentService } from '../../services/shift/ShiftAssignmentService';

// Thunks
export const fetchDoctorAssignments = createAsyncThunk(
  'doctorShiftAssignment/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await DoctorShiftAssignmentService.fetchAll(token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchDoctorAssignmentById = createAsyncThunk(
  'doctorShiftAssignment/fetchById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await DoctorShiftAssignmentService.fetchById(id, token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createDoctorAssignment = createAsyncThunk(
  'doctorShiftAssignment/create',
  async (assignmentData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await DoctorShiftAssignmentService.create(assignmentData, token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateDoctorAssignment = createAsyncThunk(
  'doctorShiftAssignment/update',
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await DoctorShiftAssignmentService.update(id, data, token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteDoctorAssignment = createAsyncThunk(
  'doctorShiftAssignment/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      await DoctorShiftAssignmentService.delete(id, token);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const doctorShiftAssignmentSlice = createSlice({
  name: 'doctorShiftAssignment',
  initialState: {
    items: [],
    currentAssignment: null,
    loading: false,
    error: null
  },
  reducers: {
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    }
  },
extraReducers: builder => {
    builder
      // Fetch All
      .addCase(fetchDoctorAssignments.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDoctorAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch By ID
      .addCase(fetchDoctorAssignmentById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorAssignmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAssignment = action.payload;
      })
      .addCase(fetchDoctorAssignmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createDoctorAssignment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDoctorAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createDoctorAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateDoctorAssignment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctorAssignment.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex(i => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        state.currentAssignment = action.payload;
      })
      .addCase(updateDoctorAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteDoctorAssignment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDoctorAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(i => i.id !== action.payload);
        if (state.currentAssignment && state.currentAssignment.id === action.payload) {
          state.currentAssignment = null;
        }
      })
      .addCase(deleteDoctorAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentAssignment } = doctorShiftAssignmentSlice.actions;
export default doctorShiftAssignmentSlice.reducer;