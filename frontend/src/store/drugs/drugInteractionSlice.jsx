import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import DrugInteractionService from '../../services/drugs/DrugInteractionService';
import { fetchDrugs } from '../drugs/drugSlice';

// Fetch all drug drugInteractions
export const fetchDrugInteractions = createAsyncThunk(
  'drugInteraction/fetchDrugInteractions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await DrugInteractionService.fetchDrugInteractions(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch interaction by ID
export const fetchDrugInteractionById = createAsyncThunk(
  'drugInteraction/fetchDrugInteractionById',
  async (drugInteractionId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await DrugInteractionService.fetchDrugInteractionById(drugInteractionId, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create interaction
export const createDrugInteraction = createAsyncThunk(
  'drugInteraction/createDrugInteraction',
  async (interactionData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await DrugInteractionService.createDrugInteraction(interactionData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update interaction
export const updateDrugInteraction = createAsyncThunk(
  'drugInteraction/updateDrugInteraction',
  async ({ drugInteractionId, updatedData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await DrugInteractionService.updateDrugInteraction(drugInteractionId, updatedData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete interaction
export const deleteDrugInteraction = createAsyncThunk(
  'drugInteraction/deleteDrugInteraction',
  async (drugInteractionId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      await DrugInteractionService.deleteDrugInteraction(drugInteractionId, token);
      return drugInteractionId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const drugInteractionSlice = createSlice({
  name: 'drugInteraction',
  initialState: {
    drugInteractions: [],
    drugs: [],
    selectedDrugInteraction: null,
    loading: false,
    error: null
  },
  reducers: {
    clearSelectedDrugInteraction: (state) => {
      state.selectedDrugInteraction = null;
      state.error = null;
    },
    clearDrugInteractionError: (state) => {
      state.error = null;
    },
    clearDrugInteractionLoading: (state) => {
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder

     .addCase(fetchDrugs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            
            .addCase(fetchDrugs.fulfilled, (state, action) => {
                state.loading = false;
                state.drugs = action.payload;
            })
            .addCase(fetchDrugs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
      .addCase(fetchDrugInteractions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrugInteractions.fulfilled, (state, action) => {
        state.loading = false;
        state.drugInteractions = action.payload;
      })
      .addCase(fetchDrugInteractions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchDrugInteractionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrugInteractionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDrugInteraction = action.payload;
      })
      .addCase(fetchDrugInteractionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createDrugInteraction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDrugInteraction.fulfilled, (state, action) => {
        state.loading = false;
        state.drugInteractions.push(action.payload);
      })
      .addCase(createDrugInteraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateDrugInteraction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDrugInteraction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.drugInteractions.findIndex(i => i.id === action.payload.id);
        if (index !== -1) state.drugInteractions[index] = action.payload;
      })
      .addCase(updateDrugInteraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteDrugInteraction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDrugInteraction.fulfilled, (state, action) => {
        state.loading = false;
        state.drugInteractions = state.drugInteractions.filter(i => i.id !== action.payload);
      })
      .addCase(deleteDrugInteraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearSelectedDrugInteraction,
  clearDrugInteractionError,
  clearDrugInteractionLoading
} = drugInteractionSlice.actions;

export default drugInteractionSlice.reducer;
