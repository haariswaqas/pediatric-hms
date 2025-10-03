// src/store/shifts/nurseShiftAssignmentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { NurseShiftAssignmentService } from '../../services/shift/ShiftAssignmentService';

// Thunks
export const fetchNurseAssignments = createAsyncThunk(
  'nurseShiftAssignment/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await NurseShiftAssignmentService.fetchAll(token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchNurseAssignmentById = createAsyncThunk(
  'nurseShiftAssignment/fetchById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await NurseShiftAssignmentService.fetchById(id, token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createNurseAssignment = createAsyncThunk(
  'nurseShiftAssignment/create',
  async (assignmentData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await NurseShiftAssignmentService.create(assignmentData, token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateNurseAssignment = createAsyncThunk(
  'nurseShiftAssignment/update',
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await NurseShiftAssignmentService.update(id, data, token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteNurseAssignment = createAsyncThunk(
  'nurseShiftAssignment/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      await NurseShiftAssignmentService.delete(id, token);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const nurseShiftAssignmentSlice = createSlice({
  name: 'nurseShiftAssignment',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {clearCurrentAssignment: (state) => {
    state.currentAssignment = null;
  }
},
  extraReducers: builder => {
    builder
      // Fetch
      .addCase(fetchNurseAssignments.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNurseAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNurseAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       // Fetch By ID
             .addCase(fetchNurseAssignmentById.pending, state => {
               state.loading = true;
               state.error = null;
             })
             .addCase(fetchNurseAssignmentById.fulfilled, (state, action) => {
               state.loading = false;
               state.currentAssignment = action.payload;
             })
             .addCase(fetchNurseAssignmentById.rejected, (state, action) => {
               state.loading = false;
               state.error = action.payload;
             })
      // Create
      .addCase(createNurseAssignment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNurseAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createNurseAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateNurseAssignment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNurseAssignment.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex(i => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateNurseAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteNurseAssignment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNurseAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(i => i.id !== action.payload);
      })
      .addCase(deleteNurseAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});


export const { clearCurrentAssignment } = nurseShiftAssignmentSlice.actions;
export default nurseShiftAssignmentSlice.reducer;