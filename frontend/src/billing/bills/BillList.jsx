// src/components/billing/BillList.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBills } from "../../store/billing/billSlice";
import { fetchBillPdf } from "../../store/billing/billGenerationSlice";
import { useNavigate } from "react-router-dom";
import { createPaymentIntent } from "../../store/billing/paymentSlice";

const formatCurrency = (value) => {
  if (value == null) return "-";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(Number(value));
  } catch {
    return `$${Number(value).toFixed(2)}`;
  }
};

const BillList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { bills, loading, error } = useSelector((state) => state.bill);
  const { billPdfs, loading: pdfLoading, error: pdfError } = useSelector(
    (state) => state.billGeneration
  );
  const { loading: paymentLoading } = useSelector((state) => state.payment);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    dispatch(fetchBills());
  }, [dispatch]);

  const handleGenerateBillPdf = async (billNumber) => {
    const result = await dispatch(fetchBillPdf(billNumber));
    if (result.meta.requestStatus === "fulfilled") {
      const fileUrl = result.payload.fileUrl;
      window.open(fileUrl, "_blank");
    }
  };

  const handlePayNow = async (billId) => {
    const token = localStorage.getItem("access");
    if (!token) return console.error("No auth token found");

    const result = await dispatch(createPaymentIntent({ billId, token }));

    if (result.meta.requestStatus === "fulfilled") {
      navigate(`/billing/bills/${billId}/pay`, {
        state: { clientSecret: result.payload.client_secret },
      });
    } else {
      console.error("Failed to create payment intent:", result.payload);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-700 dark:text-gray-200">Loading bills...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Bills</h1>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {pdfLoading && <span className="mr-3">Generating PDF...</span>}
          {paymentLoading && <span className="mr-3">Processing payment...</span>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300">Bill #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300">Child</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300">Guardian</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300">Subtotal</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300">Total</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300">Paid</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300">Created</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bills?.length > 0 ? (
              bills.map((bill, idx) => {
                const isFullyPaid = Number(bill.amount_paid || 0) >= Number(bill.total_amount || 0);
                return (
                  <tr
                    key={bill.id}
                    className={`border-b dark:border-gray-700 ${idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900/40"} hover:bg-gray-100 dark:hover:bg-gray-900 cursor-default`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{bill.bill_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      {bill.child?.first_name} {bill.child?.last_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      {bill.child?.guardian_details?.first_name} {bill.child?.guardian_details?.last_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-200">{formatCurrency(bill.subtotal)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-800 dark:text-gray-100 font-medium">{formatCurrency(bill.total_amount)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-200">{formatCurrency(bill.amount_paid)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{new Date(bill.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm flex items-center justify-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/billing/bills/${bill.id}`);
                        }}
                        className="px-3 py-1 rounded text-sm font-medium bg-transparent border border-transparent text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-gray-700"
                        title="View bill"
                      >
                        View
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBill(bill);
                          setShowConfirm(true);
                        }}
                        className="px-3 py-1 rounded text-sm font-medium bg-transparent border border-transparent text-green-600 hover:bg-green-50 dark:text-green-300 dark:hover:bg-gray-700"
                        title="Generate PDF"
                      >
                        PDF
                      </button>

                      {!isFullyPaid ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayNow(bill.id);
                          }}
                          disabled={paymentLoading}
                          className={`px-3 py-1 rounded text-sm font-semibold text-white ${paymentLoading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"} shadow-sm`}
                          title="Pay now"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span className="px-3 py-1 rounded text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Paid</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-600 dark:text-gray-300">
                  No bills found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && selectedBill && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Generate PDF</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Do you want to generate a PDF for <strong>{selectedBill.bill_number}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleGenerateBillPdf(selectedBill.bill_number);
                }}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Yes, Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillList;
