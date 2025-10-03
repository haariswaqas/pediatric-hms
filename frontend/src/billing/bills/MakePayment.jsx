// src/components/billing/MakePayment.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { createPaymentIntent, completePayment, resetPayment } from "../../store/billing/paymentSlice";

const MakePayment = () => {
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { billId } = useParams();
  const location = useLocation();

  const [localClientSecret, setLocalClientSecret] = useState(null);
  const [localPaymentIntentId, setLocalPaymentIntentId] = useState(null);
  const [paymentRecordId, setPaymentRecordId] = useState(null); // ID of DB Payment created by create_intent
  const [amount, setAmount] = useState(""); // amount in dollars
  const [currency, setCurrency] = useState("USD");

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  const token = useSelector((state) => state.auth?.access);
  const { clientSecret: reduxClientSecret, loading, error, completingPayment } = useSelector((state) => state.payment || {});

  // If calling page passed a clientSecret and amount, prefer that
  useEffect(() => {
    const state = location.state || {};
    if (state.client_secret) setLocalClientSecret(state.client_secret);
    if (state.payment_intent_id) setLocalPaymentIntentId(state.payment_intent_id);
    if (state.amount) setAmount(String(state.amount));
    if (state.currency) setCurrency(state.currency.toUpperCase());
    if (state.payment_id) setPaymentRecordId(state.payment_id);
  }, [location.state]);

  useEffect(() => {
    // If we don't have a client secret yet (not passed via navigation), create an intent when component mounts
    // We'll create it for a default amount if amount is set; otherwise backend will use full unpaid amount
    const doCreateIntent = async () => {
      if (localClientSecret) return; // already have one
      if (!billId || !token) return;

      try {
        // If amount is provided in the UI, include it in the create_intent request (backend needs to accept this)
        const payload = { bill: billId };
        if (amount) payload.amount = amount;

        // dispatch and unwrap to get the returned data directly
        const res = await dispatch(createPaymentIntent({ billId, token, amount })).unwrap();
        // Example res contains: client_secret, payment_intent_id, amount, currency, id (payment record id)
        setLocalClientSecret(res.client_secret);
        setLocalPaymentIntentId(res.payment_intent_id);
        setPaymentRecordId(res.id || res.payment_id || null);
        if (res.amount) setAmount(String(res.amount));
        if (res.currency) setCurrency(String(res.currency).toUpperCase());
      } catch (err) {
        console.error("Failed to create payment intent:", err);
        setPaymentError(err?.message || "Failed to create payment intent.");
      }
    };

    doCreateIntent();

    return () => {
      dispatch(resetPayment());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentError(null);
    setPaymentStatus("processing");

    if (!stripe || !elements) {
      setPaymentError("Stripe is not loaded. Refresh and try again.");
      setPaymentStatus(null);
      return;
    }

    if (!localClientSecret) {
      setPaymentError("Payment is not ready. Please try again.");
      setPaymentStatus(null);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError("Card input not available. Reload the page.");
      setPaymentStatus(null);
      return;
    }

    try {
      const result = await stripe.confirmCardPayment(localClientSecret, {
        payment_method: { card: cardElement },
      });

      if (result.error) {
        console.error("Stripe error:", result.error);
        const errPi = result.error.payment_intent;
        if (errPi && errPi.status === "succeeded") {
          // Already succeeded -> notify backend below
        } else {
          setPaymentError(result.error.message || "Payment failed.");
          setPaymentStatus("failed");
          return;
        }
      }

      const paymentIntent = result.paymentIntent;
      // If result.paymentIntent is undefined (Stripe returned error but status succeeded),
      // fallback to using localPaymentIntentId
      const intentObj = paymentIntent || (result.error && result.error.payment_intent) || null;

      if (intentObj && (intentObj.status === "succeeded" || intentObj.status === "requires_capture")) {
        // Build the payment data we will send to backend.
        // IMPORTANT: include payment_intent_id so backend re-uses existing intent and does not create a new one.
        const paymentData = {
          bill: parseInt(billId, 10),
          amount: parseFloat(amount),
          currency: (currency || "USD").toUpperCase(),
          payment_intent_id: localPaymentIntentId || (intentObj && intentObj.id),
        };

        try {
          await dispatch(completePayment({ paymentData, token })).unwrap();
          setPaymentStatus("succeeded");
          alert("Payment successful");
          navigate("/billing/bills");
        } catch (backendErr) {
          console.error("Backend error recording payment:", backendErr);
          setPaymentError("Payment succeeded but failed to record it on server.");
          setPaymentStatus("failed");
        }
      } else {
        console.error("Unexpected paymentIntent/status:", intentObj);
        setPaymentError("Payment did not complete. Status: " + (intentObj && intentObj.status));
        setPaymentStatus("failed");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setPaymentError(err.message || "An unexpected error occurred during payment.");
      setPaymentStatus("failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Make Payment</h2>

      <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
        <p><strong>Debug:</strong></p>
        <p>Bill ID: {billId}</p>
        <p>Client Secret: {localClientSecret ? "✅" : "❌"}</p>
      </div>

      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {paymentError && <p className="text-red-500 mb-4">{paymentError}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Amount ({currency})</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded border p-2"
            required
          />
        </label>

        <div className="p-3 border rounded bg-gray-50">
          <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
        </div>

        <button
          type="submit"
          disabled={!stripe || loading || completingPayment || paymentStatus === "processing"}
          className={`w-full px-4 py-3 rounded font-medium ${(!stripe || loading || completingPayment || paymentStatus === "processing") ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} text-white`}
        >
          {paymentStatus === "processing" ? "Processing..." : "Pay Now"}
        </button>
      </form>
    </div>
  );
};

export default MakePayment;
