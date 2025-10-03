import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import LabResultService from '../../services/lab/LabResultService';

// Thunks for lab results
export const fetchLabResults = createAsyncThunk(
  'labResult/fetchLabResults',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await LabResultService.fetchLabResults(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLabResultById = createAsyncThunk(
  'labResult/fetchLabResultById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await LabResultService.fetchLabResultById(id, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createLabResult = createAsyncThunk(
  'labResult/createLabResult',
  async (data, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await LabResultService.createLabResult(data, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLabResult = createAsyncThunk(
  'labResult/updateLabResult',
  async ({ id, updatedData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await LabResultService.updateLabResult(id, updatedData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteLabResult = createAsyncThunk(
  'labResult/deleteLabResult',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await LabResultService.deleteLabResult(id, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const labResultSlice = createSlice({
  name: 'labResult',
  initialState: {
    labResults: [],
    selectedLabResult: null,
    loading: false,
    error: null
  },
  reducers: {
    clearSelectedLabResult: (state) => {
      state.selectedLabResult = null;
      state.error = null;
    },
    clearLabResultError: (state) => {
      state.error = null;
    },
    clearLabResultLoading: (state) => {
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchLabResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabResults.fulfilled, (state, action) => {
        state.loading = false;
        state.labResults = action.payload;
      })
      .addCase(fetchLabResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetch by id
      .addCase(fetchLabResultById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabResultById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedLabResult = action.payload;
      })
      .addCase(fetchLabResultById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // create
      .addCase(createLabResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLabResult.fulfilled, (state, action) => {
        state.loading = false;
        state.labResults.push(action.payload);
      })
      .addCase(createLabResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // update
      .addCase(updateLabResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLabResult.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.labResults.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.labResults[idx] = action.payload;
      })
      .addCase(updateLabResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // delete
      .addCase(deleteLabResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLabResult.fulfilled, (state, action) => {
        state.loading = false;
        state.labResults = state.labResults.filter(r => r.id !== action.payload.id);
      })
      .addCase(deleteLabResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearSelectedLabResult,
  clearLabResultError,
  clearLabResultLoading
} = labResultSlice.actions;

export default labResultSlice.reducer;
