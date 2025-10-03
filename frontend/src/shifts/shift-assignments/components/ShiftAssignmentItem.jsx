// src/shifts/components/ShiftAssignmentItem.jsx
import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable component for displaying a single shift assignment
 * @param {Object} props
 * @param {Object} props.assignment - The assignment data
 * @param {string} props.roleType - Type of role (doctor, nurse, etc.)
 * @param {Function} props.onDelete - Function to call when delete is confirmed
 */
export default function ShiftAssignmentItem({ assignment, roleType, onDelete }) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Determine the name field based on role type
  const nameField = `${roleType}_details`;
  const personName = assignment[nameField] ? 
    `${assignment[nameField].first_name} ${assignment[nameField].last_name}` : 
    'Unknown Name';
  
  // Capitalize role for display
  const displayRole = roleType.charAt(0).toUpperCase() + roleType.slice(1);

  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center">
        <div className="mb-4 sm:mb-0">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
            {displayRole === 'Doctor' ? 'Dr.' : ''} {personName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ID: {assignment[roleType]}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/shifts/assign/${roleType}/edit/${assignment.id}`)}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition flex items-center"
          >
            <span>Edit</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition flex items-center"
          >
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Shift details */}
      <div className="mt-4">
        <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
          <Calendar size={18} className="mr-2" />
          <span className="font-medium">Assigned Shifts ({assignment.shift_details.length})</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {assignment.shift_details.map((shift, idx) => (
            <div 
              key={idx} 
              className="flex items-center p-2 rounded-md bg-gray-100 dark:bg-gray-700"
            >
              <Clock size={16} className="mr-2 text-blue-500" />
              <span className="text-gray-800 dark:text-gray-200">
                {shift.day}: {shift.start_time} - {shift.end_time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="mt-4 p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md">
          <p className="text-red-700 dark:text-red-300">
            Are you sure you want to delete this assignment for {displayRole === 'Doctor' ? 'Dr.' : ''} {personName}?
          </p>
          <div className="mt-3 flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDelete(assignment.id);
                setShowDeleteConfirm(false);
              }}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
