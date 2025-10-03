import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import PrescriptionItemService from "../../services/prescriptions/PrescriptionItemService";



// Fetch all prescription items
export const fetchPrescriptionItems = createAsyncThunk(
    'prescriptionItem/fetchPrescriptionItems',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await PrescriptionItemService.fetchPrescriptionItems(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Fetch prescription item by ID
export const fetchPrescriptionItemById = createAsyncThunk(
    'prescriptionItem/fetchPrescriptionItemById',
    async (prescriptionItemId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await PrescriptionItemService.fetchPrescriptionItemById(prescriptionItemId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Search prescription items
export const searchPrescriptionItems = createAsyncThunk(
    'prescriptionItem/searchPrescriptionItems',
    async (query, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await PrescriptionItemService.searchPrescriptionItems(query, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);



// Create prescription item
export const createPrescriptionItem = createAsyncThunk(
    'prescriptionItem/createPrescriptionItem',
    async (prescriptionItemData, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await PrescriptionItemService.createPrescriptionItem(prescriptionItemData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Update prescription item
export const updatePrescriptionItem = createAsyncThunk(
    'prescriptionItem/updatePrescriptionItem',
    async ({ prescriptionItemId, updatedData }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await PrescriptionItemService.updatePrescriptionItem(prescriptionItemId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Delete prescription item
export const deletePrescriptionItem = createAsyncThunk(
    'prescriptionItem/deletePrescriptionItem',
    async (prescriptionItemId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            await PrescriptionItemService.deletePrescriptionItem(prescriptionItemId, token);
            return prescriptionItemId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


const prescriptionItemSlice = createSlice({
    name: 'prescriptionItem',
    initialState: {
        prescriptionItems: [],
        searchResults: [],
        selectedPrescriptionItem: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearPrescriptionItemError: (state) => {
            state.error = null;
        },
        clearPrescriptionItemLoading: (state) => {
            state.loading = false;
        },
        clearSelectedPrescriptionItem: (state) => {
            state.selectedPrescriptionItem = null;
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all prescription items
            .addCase(fetchPrescriptionItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPrescriptionItems.fulfilled, (state, action) => {
                state.loading = false;
                state.prescriptionItems = action.payload;
            })
            .addCase(fetchPrescriptionItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch prescription item by ID
            .addCase(fetchPrescriptionItemById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPrescriptionItemById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedPrescriptionItem = action.payload;
            })
            .addCase(fetchPrescriptionItemById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Search prescription items
            .addCase(searchPrescriptionItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchPrescriptionItems.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = action.payload;
            })
            .addCase(searchPrescriptionItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
        

         

            // Create prescription item
            .addCase(createPrescriptionItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPrescriptionItem.fulfilled, (state, action) => {
                state.loading = false;
                state.prescriptionItems.push(action.payload);
            })
            .addCase(createPrescriptionItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update prescription item
            .addCase(updatePrescriptionItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePrescriptionItem.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.prescriptionItems.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.prescriptionItems[index] = action.payload;
                }
            })
            .addCase(updatePrescriptionItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete prescription item
            .addCase(deletePrescriptionItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePrescriptionItem.fulfilled, (state, action) => {
                state.loading = false;
                state.prescriptionItems = state.prescriptionItems.filter(item => item.id !== action.payload);
            })
            .addCase(deletePrescriptionItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    clearPrescriptionItemError,
    clearPrescriptionItemLoading,
    clearSelectedPrescriptionItem,
    clearSearchResults
} = prescriptionItemSlice.actions;

export default prescriptionItemSlice.reducer;