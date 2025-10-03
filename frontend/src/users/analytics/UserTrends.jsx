// src/users/analytics/UserTrends.jsx
import React from 'react';

export default function UserTrends({ users }) {
  if (!users?.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-indigo-50 dark:bg-indigo-900 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-indigo-700 dark:text-indigo-200 mb-1">User Engagement</h3>
          <p className="text-sm text-indigo-600 dark:text-indigo-300">
            {users.filter(u => u.status === 'active').length} active users 
            ({Math.round(users.filter(u => u.status === 'active').length / users.length * 100)}% of total)
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-purple-700 dark:text-purple-200 mb-1">Verification Rate</h3>
          <p className="text-sm text-purple-600 dark:text-purple-300">
            {users.filter(u => u.created_by_admin).length} verified users
            ({Math.round(users.filter(u => u.created_by_admin).length / users.length * 100)}% of total)
          </p>
        </div>

        <div className="bg-pink-50 dark:bg-pink-900 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-pink-700 dark:text-pink-200 mb-1">License Documentation</h3>
          <p className="text-sm text-pink-600 dark:text-pink-300">
            {users.filter(u => u.license_document).length} users with documents
            ({Math.round(users.filter(u => u.license_document).length / users.length * 100)}% of total)
          </p>
        </div>
      </div>
    </div>
  );
}
