// src/store/vaccines/vaccineSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import VaccineService from '../../services/vaccination/VaccineService';

// Get all vaccines
export const fetchVaccines = createAsyncThunk(
    'vaccine/fetchVaccines',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await VaccineService.fetchVaccines(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get vaccine by ID
export const fetchVaccineById = createAsyncThunk(
    'vaccine/fetchVaccineById',
    async (vaccineId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await VaccineService.fetchVaccineById(vaccineId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Create new vaccine
export const createVaccine = createAsyncThunk(
    'vaccine/createVaccine',
    async (vaccineData, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await VaccineService.createVaccine(vaccineData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update existing vaccine
export const updateVaccine = createAsyncThunk(
    'vaccine/updateVaccine',
    async ({ vaccineId, updatedData }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await VaccineService.updateVaccine(vaccineId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Delete vaccine
export const deleteVaccine = createAsyncThunk(
    'vaccine/deleteVaccine',
    async (vaccineId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            await VaccineService.deleteVaccine(vaccineId, token);
            return vaccineId;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const vaccineSlice = createSlice({
    name: 'vaccine',
    initialState: {
        vaccines: [],
        selectedVaccine: null,
        loading: false,
        error: null,
    },

    reducers: {
        clearSelectedVaccine: (state) => {
            state.selectedVaccine = null;
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchVaccines.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVaccines.fulfilled, (state, action) => {
                state.loading = false;
                state.vaccines = action.payload;
            })
            .addCase(fetchVaccines.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchVaccineById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVaccineById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedVaccine = action.payload;
            })
            .addCase(fetchVaccineById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createVaccine.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createVaccine.fulfilled, (state, action) => {
                state.loading = false;
                state.vaccines.push(action.payload);
            })
            .addCase(createVaccine.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateVaccine.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateVaccine.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.vaccines.findIndex(vaccine => vaccine.id === action.payload.id);
                if (index !== -1) {
                    state.vaccines[index] = action.payload;
                }
                if (state.selectedVaccine && state.selectedVaccine.id === action.payload.id) {
                    state.selectedVaccine = action.payload;
                }
            })
            .addCase(updateVaccine.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteVaccine.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteVaccine.fulfilled, (state, action) => {
                state.loading = false;
                state.vaccines = state.vaccines.filter(vaccine => vaccine.id !== action.payload);
                if (state.selectedVaccine && state.selectedVaccine.id === action.payload) {
                    state.selectedVaccine = null;
                }
            })
            .addCase(deleteVaccine.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearSelectedVaccine } = vaccineSlice.actions;
export default vaccineSlice.reducer;
