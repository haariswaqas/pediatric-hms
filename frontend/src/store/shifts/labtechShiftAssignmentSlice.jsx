// src/store/shifts/labtechShiftAssignmentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LabTechShiftAssignmentService } from '../../services/shift/ShiftAssignmentService';

// Thunks
export const fetchLabTechAssignments = createAsyncThunk(
  'labtechShiftAssignment/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await LabTechShiftAssignmentService.fetchAll(token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchLabTechAssignmentById = createAsyncThunk(
  'labtechShiftAssignment/fetchById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await LabTechShiftAssignmentService.fetchById(id, token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createLabTechAssignment = createAsyncThunk(
  'labtechShiftAssignment/create',
  async (assignmentData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await LabTechShiftAssignmentService.create(assignmentData, token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateLabTechAssignment = createAsyncThunk(
  'labtechShiftAssignment/update',
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await LabTechShiftAssignmentService.update(id, data, token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteLabTechAssignment = createAsyncThunk(
  'labtechShiftAssignment/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      await LabTechShiftAssignmentService.delete(id, token);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const labtechShiftAssignmentSlice = createSlice({
  name: 'labtechShiftAssignment',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {  clearCurrentAssignment: (state) => {
    state.currentAssignment = null;
  }},
  extraReducers: builder => {
    builder
      // Fetch
      .addCase(fetchLabTechAssignments.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabTechAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLabTechAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

       // Fetch By ID
                   .addCase(fetchLabTechAssignmentById.pending, state => {
                     state.loading = true;
                     state.error = null;
                   })
                   .addCase(fetchLabTechAssignmentById.fulfilled, (state, action) => {
                     state.loading = false;
                     state.currentAssignment = action.payload;
                   })
                   .addCase(fetchLabTechAssignmentById.rejected, (state, action) => {
                     state.loading = false;
                     state.error = action.payload;
                   })
      // Create
      .addCase(createLabTechAssignment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLabTechAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createLabTechAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateLabTechAssignment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLabTechAssignment.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex(i => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateLabTechAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteLabTechAssignment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLabTechAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(i => i.id !== action.payload);
      })
      .addCase(deleteLabTechAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentAssignment } = labtechShiftAssignmentSlice.actions;
export default labtechShiftAssignmentSlice.reducer;