import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-gray-100 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 flex flex-col items-center max-w-sm mx-auto">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          Loading Reports
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Please wait while we fetch your reports data...
        </p>
      </div>
    </div>
  );
}