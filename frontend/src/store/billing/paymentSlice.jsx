// src/store/billing/paymentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import PaymentService from "../../services/billing/PaymentService";

/* Existing thunks */
export const createPaymentIntent = createAsyncThunk(
  "payments/createPaymentIntent",
  async ({ billId, token }, { rejectWithValue }) => {
    try {
      return await PaymentService.createPaymentIntent(billId, token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || "Failed to create payment intent");
    }
  }
);

export const completePayment = createAsyncThunk(
  "payments/completePayment",
  async ({ paymentData, token }, { rejectWithValue }) => {
    try {
      return await PaymentService.completePayment(paymentData, token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || "Failed to complete payment");
    }
  }
);

/* NEW: fetch list of payments (supports params object: page, page_size, bill, etc.) */
export const fetchPayments = createAsyncThunk(
  "payments/fetchPayments",
  async ({ token, params = {} }, { rejectWithValue }) => {
    try {
      return await PaymentService.getPayments(token, params);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || "Failed to fetch payments");
    }
  }
);

/* NEW: fetch single payment by id */
export const fetchPaymentById = createAsyncThunk(
  "payments/fetchPaymentById",
  async ({ paymentId, token }, { rejectWithValue }) => {
    try {
      return await PaymentService.getPayment(paymentId, token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || "Failed to fetch payment");
    }
  }
);

const initialState = {
  clientSecret: null,
  paymentIntentId: null,
  loading: false,
  error: null,
  success: false,
  completedPayment: null,
  completingPayment: false,

  /* New state for payments list & detail */
  payments: [], // could be array or paginated object depending on backend response
  paymentsLoading: false,
  paymentsError: null,

  paymentDetails: null,
  paymentDetailsLoading: false,
  paymentDetailsError: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPayment: (state) => {
      state.clientSecret = null;
      state.paymentIntentId = null;
      state.loading = false;
      state.error = null;
      state.success = false;
      state.completedPayment = null;
      state.completingPayment = false;
      // do not wipe out fetched payments by default
    },
    clearError: (state) => {
      state.error = null;
      state.paymentsError = null;
      state.paymentDetailsError = null;
    },
    clearPayments: (state) => {
      state.payments = [];
      state.paymentsError = null;
    },
    clearPaymentDetails: (state) => {
      state.paymentDetails = null;
      state.paymentDetailsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create payment intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload.client_secret || action.payload.clientSecret || null;
        state.paymentIntentId = action.payload.payment_intent_id || action.payload.payment_intent_id || action.payload.paymentIntentId || null;
        state.success = true;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Failed to create payment intent";
        state.success = false;
      })

      // Complete payment
      .addCase(completePayment.pending, (state) => {
        state.completingPayment = true;
        state.error = null;
      })
      .addCase(completePayment.fulfilled, (state, action) => {
        state.completingPayment = false;
        state.completedPayment = action.payload;
        state.success = true;
      })
      .addCase(completePayment.rejected, (state, action) => {
        state.completingPayment = false;
        state.error = action.payload || action.error?.message || "Failed to complete payment";
      })

      /* NEW: fetchPayments list handlers */
      .addCase(fetchPayments.pending, (state) => {
        state.paymentsLoading = true;
        state.paymentsError = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.paymentsLoading = false;
        // Accept either an array or a paginated object:
        // If backend returns { results, count, ... } we keep it as-is
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.paymentsLoading = false;
        state.paymentsError = action.payload || action.error?.message || "Failed to fetch payments";
      })

      /* NEW: fetchPaymentById handlers */
      .addCase(fetchPaymentById.pending, (state) => {
        state.paymentDetailsLoading = true;
        state.paymentDetailsError = null;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.paymentDetailsLoading = false;
        state.paymentDetails = action.payload;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.paymentDetailsLoading = false;
        state.paymentDetailsError = action.payload || action.error?.message || "Failed to fetch payment details";
      });
  },
});

export const { resetPayment, clearError, clearPayments, clearPaymentDetails } = paymentSlice.actions;
export default paymentSlice.reducer;
