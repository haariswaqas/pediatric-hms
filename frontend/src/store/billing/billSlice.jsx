import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import BillService from '../../services/billing/BillService';

export const fetchBills = createAsyncThunk(
    'bill/fetchBills',
    async(_, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await BillService.fetchBills(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const fetchBillById = createAsyncThunk(
    'bill/fetchBillById',
    async(billId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await BillService.fetchBillById(billId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

const billSlice = createSlice({
    name: 'bill',
    initialState: {
        bills: [],
        selectedBill: null,
        loading: false,
        error: null
    },

    reducers: {
        clearSelectedBill: (state) => {
            state.selectedBill = null;
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchBills.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBills.fulfilled, (state, action) => {
                state.loading = false;
                state.bills = action.payload;
            })
            .addCase(fetchBills.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchBillById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBillById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedBill = action.payload;
            })
            .addCase(fetchBillById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
})

export const { clearSelectedBill } = billSlice.actions;

export default billSlice.reducer