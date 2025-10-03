import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import DrugDispenseService from '../../services/drugs/DrugDispenseService';
import { updateDrug } from './drugSlice';

export const fetchDrugDispenses = createAsyncThunk(
    'drugDispense/fetchDrugDispenses',
    async (_, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DrugDispenseService.fetchDrugDispenses(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
)

export const fetchDrugDispenseById = createAsyncThunk(
    'drugDispense/fetchDrugDispenseById',
    async (drugDispenseId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DrugDispenseService.fetchDrugDispenseById(drugDispenseId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
)

export const createDrugDispense = createAsyncThunk(
    'drugDispense/createDrugDispense',
    async (drugDispenseData, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DrugDispenseService.createDrugDispense(drugDispenseData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
)

export const updateDrugDispense = createAsyncThunk(
    'drugDispense/updateDrugDispense',
    async ({drugDispenseId, updatedData}, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DrugDispenseService.updateDrugDispense(drugDispenseId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
)

export const deleteDrugDispense = createAsyncThunk(
    'drugDispense/deleteDrugDispense',
    async (drugDispenseId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            await DrugDispenseService.deleteDrugDispense(drugDispenseId, token);
            return drugDispenseId;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
)

const drugDispenseSlice = createSlice({
    name: 'drugDispense',
    initialState: {
        drugDispenses: [],
        selectedDrugDispense: [], 
        loading: false,
        error: null, 
    }, 
    reducers: {
        clearSelectedDrugDispense: (state) => {
            state.selectedDrugDispense = null;
            state.error = null;
          },
          clearDrugDispenseError: (state) => {
            state.error = null;
          },
          clearDrugDispenseLoading: (state) => {
            state.loading = false;
          }
    }, 

    extraReducers: (builder) => {
        builder
            .addCase(fetchDrugDispenses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDrugDispenses.fulfilled, (state, action) => {
                state.loading = false;
                state.drugDispenses = action.payload;
            })
            .addCase(fetchDrugDispenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchDrugDispenseById.pending, (state) => {
                state.loading = true; 
                state.error = null; 
            })
            .addCase(fetchDrugDispenseById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedDrugDispense = action.payload;
            })
            .addCase(fetchDrugDispenseById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createDrugDispense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createDrugDispense.fulfilled, (state, action) => {
                state.loading = false;
                state.drugDispenses.push(action.payload);
            })
            .addCase(createDrugDispense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateDrugDispense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateDrugDispense.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.drugDispenses.findIndex(d => d.id === action.payload.id);
                if (index !== -1) state.drugDispenses[index] = action.payload;
            })
            .addCase(updateDrugDispense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteDrugDispense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteDrugDispense.fulfilled, (state, action) => {
                state.loading = false;
                state.drugDispenses = state.drugDispenses.filter(d => d.id !== action.payload);
            })
            .addCase(deleteDrugDispense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
})

export const {
    clearSelectedDrugDispense,
    clearDrugDispenseError,
    clearDrugDispenseLoading
} = drugDispenseSlice.actions;

export default drugDispenseSlice.reducer;