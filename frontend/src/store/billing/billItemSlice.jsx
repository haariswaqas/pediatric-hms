// src/store/billing/billItemSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import BillItemService from '../../services/billing/BillItemService';

// Fetch all bill items for a specific bill
export const fetchBillItems = createAsyncThunk(
    'billItem/fetchBillItems',
    async (_, { getState, rejectWithValue }) => {
      try {
        const token = getState().auth.access;
        return await BillItemService.fetchBillItems(token);
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  

// Create a new bill item
export const createBillItem = createAsyncThunk(
  'billItem/createBillItem',
  async ({ billId, itemData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await BillItemService.createBillItem(billId, itemData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update a bill item
export const updateBillItem = createAsyncThunk(
  'billItem/updateBillItem',
  async ({ itemId, updatedData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await BillItemService.updateBillItem(itemId, updatedData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete a bill item
export const deleteBillItem = createAsyncThunk(
  'billItem/deleteBillItem',
  async (itemId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await BillItemService.deleteBillItem(itemId, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const billItemSlice = createSlice({
  name: 'billItem',
  initialState: {
    items: [],
    selectedItem: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedItem: (state) => {
      state.selectedItem = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBillItems
      .addCase(fetchBillItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillItems.fulfilled, (state, action) => {
       
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBillItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createBillItem
      .addCase(createBillItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBillItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createBillItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateBillItem
      .addCase(updateBillItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBillItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateBillItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteBillItem
      .addCase(deleteBillItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBillItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((i) => i.id !== action.meta.arg);
      })
      .addCase(deleteBillItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedItem } = billItemSlice.actions;
export default billItemSlice.reducer;
