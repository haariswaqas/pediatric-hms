// src/shifts/components/ShiftAssignmentChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Reusable chart component for visualizing shift assignments
 * @param {Object} props
 * @param {Array} props.assignmentData - The full assignment data
 * @param {Array} props.uniqueDays - Array of unique days
 * @param {string} props.roleType - Type of role (doctor, nurse, etc.)
 * @param {string} props.barColor - Color to use for the bar (default: blue)
 */
export default function ShiftAssignmentChart({ 
  assignmentData, 
  uniqueDays, 
  roleType = 'staff', 
  barColor = '#3b82f6' 
}) {
  // Prepare chart data - count of staff members assigned per day
  const chartData = uniqueDays.map(day => {
    // Count how many staff members are assigned to this day
    const count = assignmentData.filter(assignment => 
      assignment.shift_details.some(shift => shift.day === day)
    ).length;
    
    return {
      day,
      count
    };
  });

  // Capitalize first letter for display
  const displayRole = roleType.charAt(0).toUpperCase() + roleType.slice(1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
        {displayRole}s Scheduled by Day
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name={`Number of ${displayRole}s`} fill={barColor} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>This chart shows how many {roleType}s are scheduled for each day of the week.</p>
      </div>
    </div>
  );
}




