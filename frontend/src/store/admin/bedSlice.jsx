// src/store/beds/bedSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import BedService from '../../services/admin/BedService';

// Get all beds
export const fetchBeds = createAsyncThunk(
    'bed/fetchBeds',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await BedService.fetchBeds(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get bed by ID
export const fetchBedById = createAsyncThunk(
    'bed/fetchBedById',
    async (bedId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await BedService.fetchBedById(bedId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Create new bed
export const createBed = createAsyncThunk(
    'bed/createBed',
    async (bedData, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await BedService.createBed(bedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update existing bed
export const updateBed = createAsyncThunk(
    'bed/updateBed',
    async ({ bedId, updatedData }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await BedService.updateBed(bedId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Delete bed
export const deleteBed = createAsyncThunk(
    'bed/deleteBed',
    async (bedId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            await BedService.deleteBed(bedId, token);
            return bedId;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const bedSlice = createSlice({
    name: 'bed',
    initialState: {
        beds: [],
        selectedBed: null,
        loading: false,
        error: null,
    },

    reducers: {
        clearSelectedBed: (state) => {
            state.selectedBed = null;
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchBeds.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBeds.fulfilled, (state, action) => {
                state.loading = false;
                state.beds = action.payload;
            })
            .addCase(fetchBeds.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchBedById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBedById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedBed = action.payload;
            })
            .addCase(fetchBedById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createBed.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBed.fulfilled, (state, action) => {
                state.loading = false;
                state.beds.push(action.payload);
            })
            .addCase(createBed.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateBed.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBed.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.beds.findIndex(bed => bed.id === action.payload.id);
                if (index !== -1) {
                    state.beds[index] = action.payload;
                }
                if (state.selectedBed && state.selectedBed.id === action.payload.id) {
                    state.selectedBed = action.payload;
                }
            })
            .addCase(updateBed.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteBed.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBed.fulfilled, (state, action) => {
                state.loading = false;
                state.beds = state.beds.filter(bed => bed.id !== action.payload);
                if (state.selectedBed && state.selectedBed.id === action.payload) {
                    state.selectedBed = null;
                }
            })
            .addCase(deleteBed.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearSelectedBed } = bedSlice.actions;
export default bedSlice.reducer;
