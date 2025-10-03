import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayments, fetchPaymentById } from "../../store/billing/paymentSlice";
import {
  X, FileText, Eye, BarChart3, List, TrendingUp, 
  RefreshCw, Filter, Search, Download
} from "lucide-react";
import { SummaryCards } from "./payment-components/SummaryCards";
import { FilterControls } from "./payment-components/FilterControls";
import { PaymentRow } from "./payment-components/PaymentRow";
import { PaymentDetailModal } from "./payment-components/PaymentDetailModal";
import { PaymentAnalyticsDashboard } from "./payment-components/PaymentAnalytics";
import { GroupHeader } from "./payment-components/GroupHeader";

// Main component
const PaymentList = () => {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth?.access) || localStorage.getItem("access");

  const {
    payments,
    paymentsLoading,
    paymentsError,
    paymentDetails,
    paymentDetailsLoading,
  } = useSelector((s) => s.payment || {});

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [groupBy, setGroupBy] = useState("");
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'analytics'

  // Normalize payments
  const normalizedPayments = Array.isArray(payments)
    ? payments
    : payments && payments.results
    ? payments.results
    : [];

  // Filter and group payments
  const { filteredPayments, groupedPayments } = useMemo(() => {
    let filtered = normalizedPayments.filter(payment => {
      const matchesSearch = searchTerm === "" || 
        payment.id.toString().includes(searchTerm) ||
        payment.bill_details?.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.patient_details?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.patient_details?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.parent_details?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.parent_details?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "" || payment.status === statusFilter;
      const matchesMethod = methodFilter === "" || payment.method === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });

    let grouped = {};
    if (groupBy) {
      filtered.forEach(payment => {
        let groupValue;
        switch (groupBy) {
          case 'status':
            groupValue = payment.status;
            break;
          case 'method':
            groupValue = payment.method;
            break;
          case 'patient':
            groupValue = `${payment.patient_details?.first_name} ${payment.patient_details?.last_name}`;
            break;
          case 'bill_number':
            groupValue = payment.bill_details?.bill_number;
            break;
          default:
            groupValue = 'Other';
        }
        
        if (!grouped[groupValue]) {
          grouped[groupValue] = [];
        }
        grouped[groupValue].push(payment);
      });
    }

    return { filteredPayments: filtered, groupedPayments: grouped };
  }, [normalizedPayments, searchTerm, statusFilter, methodFilter, groupBy]);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchPayments({ token })).catch((e) => {
      console.warn("fetchPayments error:", e);
    });
  }, [dispatch, token]);

  const handleRefresh = () => {
    if (!token) return;
    dispatch(fetchPayments({ token }));
  };

  const handleView = async (paymentId) => {
    if (!token) return;
    try {
      const res = await dispatch(fetchPaymentById({ paymentId, token }));
      if (res.meta.requestStatus === "fulfilled") {
        setSelectedPayment(res.payload);
        setShowModal(true);
      } else {
        console.error("Failed to load payment detail:", res.payload || res.error);
      }
    } catch (err) {
      console.error("Error fetching payment detail:", err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
  };

  const handleExportData = () => {
    // Create CSV content
    const csvContent = [
      ['Bill Number', 'Patient', 'Amount', 'Method', 'Status', 'Date Created'].join(','),
      ...filteredPayments.map(payment => [
        payment.bill_details?.bill_number || '',
        `${payment.patient_details?.first_name || ''} ${payment.patient_details?.last_name || ''}`,
        payment.amount || '0',
        payment.method || '',
        payment.status || '',
        new Date(payment.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (paymentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span>Loading payment data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (paymentsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <X className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                  Error Loading Payments
                </h3>
                <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                  {String(paymentsError)}
                </p>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Title and Stats */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                    Payment Management
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    Track and manage all payment transactions
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center space-x-6 pt-2">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Total: <span className="font-semibold text-slate-900 dark:text-white">{normalizedPayments.length}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Completed: <span className="font-semibold text-slate-900 dark:text-white">
                      {normalizedPayments.filter(p => p.status === 'completed').length}
                    </span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Pending: <span className="font-semibold text-slate-900 dark:text-white">
                      {normalizedPayments.filter(p => p.status === 'pending').length}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4 mr-2" />
                  List View
                </button>
        
              </div>

              <button
                onClick={handleExportData}
                className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/25"
              >
                <Download className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Export Data
              </button>
              
              <button
                onClick={handleRefresh}
                className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25"
              >
                <RefreshCw className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard - Show when analytics view is selected */}
        <PaymentAnalyticsDashboard 
          payments={normalizedPayments} 
          isVisible={viewMode === 'analytics'} 
        />

        {/* List View Content - Show when list view is selected */}
        {viewMode === 'list' && (
          <>
            {/* Summary Cards */}
            <SummaryCards payments={filteredPayments} />

            {/* Filter Controls */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <FilterControls
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                methodFilter={methodFilter}
                setMethodFilter={setMethodFilter}
                groupBy={groupBy}
                setGroupBy={setGroupBy}
                onRefresh={handleRefresh}
              />
            </div>

            {/* Payments Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <tr>
                      {[
                        { key: 'Bill Number', icon: FileText },
                        { key: 'Patient', icon: null },
                        { key: 'Amount', icon: null },
                        { key: 'Method', icon: null },
                        { key: 'Status', icon: null },
                        { key: 'Date Created', icon: null },
                        { key: 'Actions', icon: null }
                      ].map(({ key, icon: Icon }) => (
                        <th key={key} className="px-6 py-4 text-left">
                          <div className="flex items-center space-x-2">
                            {Icon && <Icon className="w-4 h-4 text-slate-500" />}
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              {key}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                              <FileText className="w-8 h-8 text-slate-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                No payments found
                              </h3>
                              <p className="text-slate-500 dark:text-slate-400 text-sm">
                                {searchTerm || statusFilter || methodFilter 
                                  ? "Try adjusting your filters to see more results." 
                                  : "No payment records available at the moment."
                                }
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : groupBy ? (
                      // Grouped display
                      Object.entries(groupedPayments).map(([groupValue, groupPayments]) => (
                        <React.Fragment key={groupValue}>
                          <GroupHeader 
                            groupKey={groupBy} 
                            groupValue={groupValue} 
                            count={groupPayments.length} 
                          />
                          {groupPayments.map((payment, index) => (
                            <PaymentRow 
                              key={payment.id} 
                              payment={payment} 
                              onView={handleView}
                              index={index}
                            />
                          ))}
                        </React.Fragment>
                      ))
                    ) : (
                      // Regular display
                      filteredPayments.map((payment, index) => (
                        <PaymentRow 
                          key={payment.id} 
                          payment={payment} 
                          onView={handleView}
                          index={index}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Results summary */}
            {filteredPayments.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <div>
                    Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredPayments.length}</span> of <span className="font-semibold text-slate-900 dark:text-white">{normalizedPayments.length}</span> payments
                  </div>
                  {(searchTerm || statusFilter || methodFilter) && (
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4" />
                      <span>Filters applied</span>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("");
                          setMethodFilter("");
                          setGroupBy("");
                        }}
                        className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Payment Detail Modal */}
        <PaymentDetailModal
          payment={selectedPayment}
          isOpen={showModal}
          onClose={handleCloseModal}
          isLoading={paymentDetailsLoading}
        />
      </div>
    </div>
  );
};

export default PaymentList;