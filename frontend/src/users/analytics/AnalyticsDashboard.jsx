// src/users/analytics/UserAnalyticsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../store/admin/userManagementSlice';
import UserAnalytics from './UserAnalytics';
import UserTrends from './UserTrends';
import { exportLogsToPDF } from './pdfGenerator';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export default function AnalyticsDashboard() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((s) => s.userManagement);
  
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [showTrends, setShowTrends] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(fetchUsers()).finally(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  };

  if (loading && !refreshing) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin text-blue-600">
          <RefreshCw size={36} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg shadow">
        <p>Error loading users: {error}</p>
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Analytics Dashboard</h1>
          <button 
            onClick={handleRefresh} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Refresh Data"
          >
            <RefreshCw 
              size={20} 
              className={`text-blue-600 dark:text-blue-400 ${refreshing ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg text-center shadow">
              <p className="text-sm text-gray-500 dark:text-gray-300">Total Users</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{users?.length || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg text-center shadow">
              <p className="text-sm text-gray-500 dark:text-gray-300">Active Users</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {users?.filter(u => u.status === 'active').length || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg text-center shadow">
              <p className="text-sm text-gray-500 dark:text-gray-300">Pending Verification</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {users?.filter(u => !u.created_by_admin && u.role !== 'parent').length || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg text-center shadow">
              <p className="text-sm text-gray-500 dark:text-gray-300">Verification Rate</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {users?.length 
                  ? Math.round(users.filter(u => u.created_by_admin).length / users.length * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Demographics & Distribution */}
      <div className="mb-6">
        <div 
          className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900 p-4 rounded-lg cursor-pointer shadow"
          onClick={() => setShowAnalytics(!showAnalytics)}
        >
          <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-100">
            User Demographics & Distribution
          </h2>
          {showAnalytics ? 
            <ChevronUp className="text-indigo-700 dark:text-indigo-100" /> : 
            <ChevronDown className="text-indigo-700 dark:text-indigo-100" />
          }
        </div>
        {showAnalytics && <UserAnalytics users={users} />}
      </div>

      {/* User Summary Insights */}
      <div className="mb-6">
        <div 
          className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900 p-4 rounded-lg cursor-pointer shadow"
          onClick={() => setShowTrends(!showTrends)}
        >
          <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-100">
            User Summary Insights
          </h2>
          {showTrends ? 
            <ChevronUp className="text-emerald-700 dark:text-emerald-100" /> : 
            <ChevronDown className="text-emerald-700 dark:text-emerald-100" />
          }
        </div>
        {showTrends && <UserTrends users={users} />}
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => window.location.href = '/users/view-all'}
          className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 mr-2"
        >
          View User Table
        </button>



      </div>
    </div>
  );
}
