// src/services/billing/PaymentService.jsx
import axios from "axios";
import API from "../api";
import { handleRequestError } from "../handleRequestError";

const PaymentService = {
  // Create payment intent for a bill
  createPaymentIntent: async (billId, token) => {
    if (!billId) throw new Error("Bill ID is required");
    if (!token) throw new Error("Authorization token is missing");

    try {
      const res = await axios.post(
        `${API}/payments/create_intent/`,
        { bill: billId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data; // contains client_secret + payment info
    } catch (err) {
      handleRequestError(err);
      throw err;
    }
  },

  // Complete the payment after Stripe confirmation
  completePayment: async (paymentData, token) => {
    if (!paymentData) throw new Error("Payment data is required");
    if (!token) throw new Error("Authorization token is missing");

    try {
      const res = await axios.post(
        `${API}/payments/`,
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    } catch (err) {
      handleRequestError(err);
      throw err;
    }
  },

  // NEW: fetchPayments - list endpoint with optional query params
  fetchPayments: async (token, params = {}) => {
    if (!token) throw new Error("Authorization token is missing");

    try {
      const res = await axios.get(
        `${API}/payments/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      );
      return res.data;
    } catch (err) {
      handleRequestError(err);
      throw err;
    }
  },

  // NEW: fetchPaymentById - single payment detail
  fetchPaymentById: async (paymentId, token) => {
    if (!paymentId) throw new Error("Payment ID is required");
    if (!token) throw new Error("Authorization token is missing");

    try {
      const res = await axios.get(
        `${API}/payments/${paymentId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    } catch (err) {
      handleRequestError(err);
      throw err;
    }
  },

  // Backwards-compatible aliases (in case any code uses the old names)
  getPayments: async (token, params = {}) => {
    return await PaymentService.fetchPayments(token, params);
  },
  getPayment: async (paymentId, token) => {
    return await PaymentService.fetchPaymentById(paymentId, token);
  },
};

export default PaymentService;
