// src/store/shifts/shiftSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import ShiftService from '../../services/shift/ShiftService';

// Get all shifts
export const fetchShifts = createAsyncThunk(
    'shift/fetchShifts',
    async(_, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await ShiftService.fetchShifts(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get shift by ID
export const fetchShiftById = createAsyncThunk(
    'shift/fetchShiftById',
    async(shiftId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await ShiftService.fetchShiftById(shiftId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Create new shift
export const createShift = createAsyncThunk(
    'shift/createShift',
    async (shiftData, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await ShiftService.createShift(shiftData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update existing shift
export const updateShift = createAsyncThunk(
    'shift/updateShift',
    async ({shiftId, updatedData}, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await ShiftService.updateShift(shiftId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Delete shift
export const deleteShift = createAsyncThunk(
    'shift/deleteShift',
    async (shiftId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            await ShiftService.deleteShift(shiftId, token);
            return shiftId; // Return ID for removal from state
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const shiftSlice = createSlice({
    name: 'shift',
    initialState: {
        shifts: [],
        selectedShift: null,
        loading: false,
        error: null,
    },
    
    reducers: {
        clearSelectedShift: (state) => {
            state.selectedShift = null;
            state.error = null;
        },
    },
    
    extraReducers: (builder) => {
        builder
            // Fetch all shifts
            .addCase(fetchShifts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShifts.fulfilled, (state, action) => {
                state.loading = false;
                state.shifts = action.payload;
            })
            .addCase(fetchShifts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch shift by ID
            .addCase(fetchShiftById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShiftById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedShift = action.payload;
            })
            .addCase(fetchShiftById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Create shift
            .addCase(createShift.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createShift.fulfilled, (state, action) => {
                state.loading = false;
                state.shifts.push(action.payload);
            })
            .addCase(createShift.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Update shift
            .addCase(updateShift.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateShift.fulfilled, (state, action) => {
                state.loading = false;
                // Update the shift in the array
                const index = state.shifts.findIndex(shift => shift.id === action.payload.id);
                if (index !== -1) {
                    state.shifts[index] = action.payload;
                }
                // Update selected shift if it matches
                if (state.selectedShift && state.selectedShift.id === action.payload.id) {
                    state.selectedShift = action.payload;
                }
            })
            .addCase(updateShift.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Delete shift
            .addCase(deleteShift.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteShift.fulfilled, (state, action) => {
                state.loading = false;
                // Remove the shift from the array
                state.shifts = state.shifts.filter(shift => shift.id !== action.payload);
                // Clear selected shift if it matches
                if (state.selectedShift && state.selectedShift.id === action.payload) {
                    state.selectedShift = null;
                }
            })
            .addCase(deleteShift.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
});

export const { clearSelectedShift } = shiftSlice.actions;
export default shiftSlice.reducer;