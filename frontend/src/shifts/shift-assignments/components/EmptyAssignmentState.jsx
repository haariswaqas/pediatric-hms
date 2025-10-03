// src/shifts/components/EmptyAssignmentState.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

/**
 * Component to display when no assignments are found
 * @param {Object} props
 * @param {boolean} props.hasFilters - Whether filters are applied
 * @param {Function} props.clearFilters - Function to clear all filters
 * @param {string} props.roleType - Type of role (doctor, nurse, etc.)
 */
export default function EmptyAssignmentState({ hasFilters, clearFilters, roleType }) {
  const navigate = useNavigate();
  
  // Capitalize for display
  const displayRole = roleType.charAt(0).toUpperCase() + roleType.slice(1);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
      {hasFilters ? (
        <>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No assignments match your search criteria.
          </p>
          <button 
            onClick={clearFilters}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear filters
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No {roleType} shift assignments found.
          </p>
          <button 
            onClick={() => navigate(`/shifts/assign/${roleType}/new`)}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition inline-flex items-center"
          >
            <UserPlus size={18} className="mr-2" />
            Create First Assignment
          </button>
        </>
      )}
    </div>
  );
}
