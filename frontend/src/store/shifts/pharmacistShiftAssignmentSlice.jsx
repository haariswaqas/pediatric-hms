// src/store/shifts/pharmacistShiftAssignmentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PharmacistShiftAssignmentService } from '../../services/shift/ShiftAssignmentService';

// Thunks
export const fetchPharmacistAssignments = createAsyncThunk(
  'pharmacistShiftAssignment/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await PharmacistShiftAssignmentService.fetchAll(token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchPharmacistAssignmentById = createAsyncThunk(
  'pharmacistShiftAssignment/fetchById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await PharmacistShiftAssignmentService.fetchById(id, token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createPharmacistAssignment = createAsyncThunk(
  'pharmacistShiftAssignment/create',
  async (assignmentData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await PharmacistShiftAssignmentService.create(assignmentData, token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updatePharmacistAssignment = createAsyncThunk(
  'pharmacistShiftAssignment/update',
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await PharmacistShiftAssignmentService.update(id, data, token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deletePharmacistAssignment = createAsyncThunk(
  'pharmacistShiftAssignment/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      await PharmacistShiftAssignmentService.delete(id, token);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const pharmacistShiftAssignmentSlice = createSlice({
  name: 'pharmacistShiftAssignment',
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
      .addCase(fetchPharmacistAssignments.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPharmacistAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPharmacistAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

         // Fetch By ID
                   .addCase(fetchPharmacistAssignmentById.pending, state => {
                     state.loading = true;
                     state.error = null;
                   })
                   .addCase(fetchPharmacistAssignmentById.fulfilled, (state, action) => {
                     state.loading = false;
                     state.currentAssignment = action.payload;
                   })
                   .addCase(fetchPharmacistAssignmentById.rejected, (state, action) => {
                     state.loading = false;
                     state.error = action.payload;
                   })

      // Create
      .addCase(createPharmacistAssignment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPharmacistAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createPharmacistAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updatePharmacistAssignment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePharmacistAssignment.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex(i => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updatePharmacistAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deletePharmacistAssignment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePharmacistAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(i => i.id !== action.payload);
      })
      .addCase(deletePharmacistAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});
export const { clearCurrentAssignment } = pharmacistShiftAssignmentSlice.actions;
export default pharmacistShiftAssignmentSlice.reducer;