import React from 'react';

const ConfirmationModal = ({ 
  show, 
  title, 
  message, 
  onConfirm, 
  onClose, 
  confirmText = 'Confirm', 
  variant = 'primary' 
}) => {
  if (!show) return null;

  const getButtonStyle = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-500 dark:focus:ring-offset-gray-700';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-500 dark:focus:ring-offset-gray-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500 dark:focus:ring-offset-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out dark:bg-gray-900 dark:bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all duration-300 ease-in-out scale-100 dark:shadow-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        
        <div className="px-6 py-4 dark:text-gray-300">
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md font-medium transition-all duration-200 ease-in-out dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 ${getButtonStyle()} text-white rounded-md font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:text-white dark:focus:ring-offset-gray-700`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;