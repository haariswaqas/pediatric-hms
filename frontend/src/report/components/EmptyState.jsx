import React from 'react';
import { FileX } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-gray-100 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 flex flex-col items-center max-w-sm mx-auto">
        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full mb-4">
          <FileX className="h-10 w-10 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          No Reports Found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          You don't have any reports yet. They will appear here once created.
        </p>
      </div>
    </div>
  );
}