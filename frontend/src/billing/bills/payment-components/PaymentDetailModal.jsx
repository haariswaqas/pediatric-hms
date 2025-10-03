


// Payment detail modal
export const PaymentDetailModal = ({ payment, isOpen, onClose, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Payment Details
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: #{payment?.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Info */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payment Information</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(payment?.amount, payment?.currency)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Method</label>
                    <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {payment?.method?.replace('_', ' ')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</label>
                    <div className="mt-1">
                      <StatusBadge status={payment?.status} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Reference</label>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {payment?.reference_number || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bill & Patient Info */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Additional Details</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Bill Number</label>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{payment?.bill}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Processed By</label>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {payment?.processed_by?.username || '-'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created</label>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(payment?.created_at)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last Updated</label>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(payment?.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {payment?.notes && (
              <div className="mt-6">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Notes</label>
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{payment.notes}</p>
                </div>
              </div>
            )}

            {/* Stripe Intent */}
            {payment?.stripe_payment_intent_id && (
              <div className="mt-6">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Stripe Payment Intent</label>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                  {maskIntentId(payment.stripe_payment_intent_id)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
