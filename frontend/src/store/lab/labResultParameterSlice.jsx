// src/store/lab/labResultParameterSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import LabResultParameterService from "../../services/lab/LabResultParameterService";

// Thunks
export const fetchLabResultParameters = createAsyncThunk(
  "labResultParameter/fetchLabResultParameters",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await LabResultParameterService.fetchLabResultParameters(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLabResultParameterById = createAsyncThunk(
  "labResultParameter/fetchLabResultParameterById",
  async (labResultParameterId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await LabResultParameterService.fetchLabResultParameterById(labResultParameterId, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createLabResultParameter = createAsyncThunk(
  "labResultParameter/createLabResultParameter",
  async (labResultParameterData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await LabResultParameterService.createLabResultParameter(labResultParameterData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLabResultParameter = createAsyncThunk(
  "labResultParameter/updateLabResultParameter",
  async ({ labResultParameterId, updatedData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await LabResultParameterService.updateLabResultParameter(labResultParameterId, updatedData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteLabResultParameter = createAsyncThunk(
  "labResultParameter/deleteLabResultParameter",
  async (labResultParameterId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await LabResultParameterService.deleteLabResultParameter(labResultParameterId, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const labResultParameterSlice = createSlice({
  name: "labResultParameter",
  initialState: {
    parameters: [],
    selectedParameter: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedParameter: (state) => {
      state.selectedParameter = null;
      state.error = null;
    },
    clearParameterError: (state) => {
      state.error = null;
    },
    clearParameterLoading: (state) => {
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchLabResultParameters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabResultParameters.fulfilled, (state, action) => {
        state.loading = false;
        state.parameters = action.payload;
      })
      .addCase(fetchLabResultParameters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetch by id
      .addCase(fetchLabResultParameterById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabResultParameterById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedParameter = action.payload;
      })
      .addCase(fetchLabResultParameterById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // create
      .addCase(createLabResultParameter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLabResultParameter.fulfilled, (state, action) => {
        state.loading = false;
        state.parameters.push(action.payload);
      })
      .addCase(createLabResultParameter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // update
      .addCase(updateLabResultParameter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLabResultParameter.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.parameters.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.parameters[idx] = action.payload;
      })
      .addCase(updateLabResultParameter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // delete
      .addCase(deleteLabResultParameter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLabResultParameter.fulfilled, (state, action) => {
        state.loading = false;
        state.parameters = state.parameters.filter(p => p.id !== action.payload.id);
      })
      .addCase(deleteLabResultParameter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearSelectedParameter,
  clearParameterError,
  clearParameterLoading
} = labResultParameterSlice.actions;

export default labResultParameterSlice.reducer;
