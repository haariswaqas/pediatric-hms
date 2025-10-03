// src/store/wards/wardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import WardService from '../../services/admin/WardService';

// Get all wards
export const fetchWards = createAsyncThunk(
    'ward/fetchWards',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await WardService.fetchWards(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get ward by ID
export const fetchWardById = createAsyncThunk(
    'ward/fetchWardById',
    async (wardId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await WardService.fetchWardById(wardId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Create new ward
export const createWard = createAsyncThunk(
    'ward/createWard',
    async (wardData, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await WardService.createWard(wardData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update existing ward
export const updateWard = createAsyncThunk(
    'ward/updateWard',
    async ({ wardId, updatedData }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await WardService.updateWard(wardId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Delete ward
export const deleteWard = createAsyncThunk(
    'ward/deleteWard',
    async (wardId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            await WardService.deleteWard(wardId, token);
            return wardId;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const wardSlice = createSlice({
    name: 'ward',
    initialState: {
        wards: [],
        selectedWard: null,
        loading: false,
        error: null,
    },

    reducers: {
        clearSelectedWard: (state) => {
            state.selectedWard = null;
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchWards.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWards.fulfilled, (state, action) => {
                state.loading = false;
                state.wards = action.payload;
            })
            .addCase(fetchWards.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchWardById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWardById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedWard = action.payload;
            })
            .addCase(fetchWardById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createWard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createWard.fulfilled, (state, action) => {
                state.loading = false;
                state.wards.push(action.payload);
            })
            .addCase(createWard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateWard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateWard.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.wards.findIndex(ward => ward.id === action.payload.id);
                if (index !== -1) {
                    state.wards[index] = action.payload;
                }
                if (state.selectedWard && state.selectedWard.id === action.payload.id) {
                    state.selectedWard = action.payload;
                }
            })
            .addCase(updateWard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteWard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteWard.fulfilled, (state, action) => {
                state.loading = false;
                state.wards = state.wards.filter(ward => ward.id !== action.payload);
                if (state.selectedWard && state.selectedWard.id === action.payload) {
                    state.selectedWard = null;
                }
            })
            .addCase(deleteWard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearSelectedWard } = wardSlice.actions;
export default wardSlice.reducer;
