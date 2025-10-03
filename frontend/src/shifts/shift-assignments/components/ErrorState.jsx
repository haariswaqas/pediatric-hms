// src/shifts/components/ErrorState.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Component to display when there's an error loading assignments
 * @param {Object} props
 * @param {string} props.error - Error message
 * @param {Function} props.retry - Function to retry loading data
 * @param {string} props.roleType - Type of role (doctor, nurse, etc.)
 */
export default function ErrorState({ error, retry, roleType }) {
  // Capitalize for display
  const displayRole = roleType.charAt(0).toUpperCase() + roleType.slice(1);
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        {displayRole} Shift Assignments
      </h2>
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex justify-center items-center text-red-600 dark:text-red-400">
          <AlertTriangle size={24} />
          <span className="ml-2 text-lg">Error loading assignments: {error}</span>
        </div>
        <button 
          onClick={retry} 
          className="mt-4 mx-auto block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    </div>
  );
}