// src/store/billing/billGenerationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import BillGenerationService from "../../services/billing/BillGenerationService";

// Thunk: Fetch PDF and return blob URL
export const fetchBillPdf = createAsyncThunk(
  "billGeneration/fetchBillPdf",
  async (billNumber, { getState, rejectWithValue }) => {
    try {
      const token =
        getState().auth?.access || localStorage.getItem("access_token");
      const fileUrl = await BillGenerationService.fetchBillPdf(
        billNumber,
        token
      );
      return { billNumber, fileUrl };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk: Trigger direct download
export const downloadBillPdf = createAsyncThunk(
  "billGeneration/downloadBillPdf",
  async (billNumber, { getState, rejectWithValue }) => {
    try {
      const token =
        getState().auth?.access || localStorage.getItem("access_token");
      await BillGenerationService.downloadBillPdf(billNumber, token);
      return billNumber;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const billGenerationSlice = createSlice({
  name: "billGeneration",
  initialState: {
    billPdfs: {}, // store blob URLs keyed by billNumber
    loading: false,
    error: null,
  },
  reducers: {
    clearBillPdf: (state, action) => {
      delete state.billPdfs[action.payload];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBillPdf
      .addCase(fetchBillPdf.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillPdf.fulfilled, (state, action) => {
        state.loading = false;
        state.billPdfs[action.payload.billNumber] = action.payload.fileUrl;
      })
      .addCase(fetchBillPdf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // downloadBillPdf
      .addCase(downloadBillPdf.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadBillPdf.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(downloadBillPdf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBillPdf, clearError } = billGenerationSlice.actions;
export default billGenerationSlice.reducer;
