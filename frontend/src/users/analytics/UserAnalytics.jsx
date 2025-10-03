// src/users/analytics/UserAnalytics.jsx
import React, { useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function UserAnalytics({ users }) {
  const analytics = useMemo(() => {
    if (!users?.length) return null;
    
    const roleData = users.reduce((acc, user) => {
      const role = user.role
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    
    
    const roleChartData = Object.keys(roleData).map(role => ({
      name: role,
      value: roleData[role]
    }));
    
    const statusData = users.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    }, {});
    
    const statusChartData = Object.keys(statusData).map(status => ({
      name: status,
      value: statusData[status]
    }));
    
    const verificationData = [
      { name: 'Verified', value: users.filter(u => u.created_by_admin).length },
      { name: 'Unverified', value: users.filter(u => !u.created_by_admin).length }
    ];
    
    return {
      roleChartData,
      statusChartData,
      verificationData
    };
  }, [users]);
  
  if (!analytics) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Roles Distribution */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">User Roles Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.roleChartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {analytics.roleChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* User Status */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">User Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.statusChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Users" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Verification Status */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Verification Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.verificationData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="#00C49F" />
                <Cell fill="#FF8042" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
