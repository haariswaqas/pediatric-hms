// src/shifts/components/LoadingState.jsx
import React from 'react';

/**
 * Component to display while loading assignment data
 * @param {Object} props
 * @param {string} props.roleType - Type of role (doctor, nurse, etc.)
 */
export default function LoadingState({ roleType }) {
  // Capitalize for display
  const displayRole = roleType.charAt(0).toUpperCase() + roleType.slice(1);
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        {displayRole} Shift Assignments
      </h2>
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-lg text-gray-700 dark:text-gray-300">Loading assignments...</span>
        </div>
      </div>
    </div>
  );
}
