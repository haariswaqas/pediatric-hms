import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorMessage({ message, type = 'General' }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-300" />
        </div>
        
        <h2 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-200 mb-2">
          {type} Error
        </h2>
        
        <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-4">
          We encountered an error while loading this information. Please try again later.
        </p>
        
        <div className="bg-red-50 dark:bg-red-900/20 rounded p-3 text-xs font-mono overflow-auto max-h-32 text-red-800 dark:text-red-300">
          {typeof message === 'string' ? message : JSON.stringify(message, null, 2)}
        </div>
        
        <div className="mt-4 text-center">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded transition-colors text-sm font-medium"
          >
            Refresh page
          </button>
        </div>
      </div>
    </div>
  );
}