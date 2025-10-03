import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, PieChart, Pie } from 'recharts';
import { FileText, Clock, Database } from 'lucide-react';

const chartColors = ['#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#6366F1', '#EC4899'];

export default function ReportStats({ reports = [] }) {
  // Calculate stats
  const stats = useMemo(() => {
    // Get report types count
    const typeCount = reports.reduce((acc, report) => {
      const type = report.report_type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    // Convert to array for charts
    const typeData = Object.keys(typeCount).map((key, index) => ({
      name: key,
      value: typeCount[key],
      color: chartColors[index % chartColors.length]
    }));
    
    // Group by month
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    
    // Initialize all months with 0
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo);
      d.setMonth(sixMonthsAgo.getMonth() + i);
      const monthName = d.toLocaleString('default', { month: 'short' });
      monthlyData.push({
        name: monthName,
        count: 0,
        month: d.getMonth(),
        year: d.getFullYear()
      });
    }
    
    // Fill with actual data
    reports.forEach(report => {
      const reportDate = new Date(report.created_at);
      const reportMonth = reportDate.getMonth();
      const reportYear = reportDate.getFullYear();
      
      const monthEntry = monthlyData.find(
        m => m.month === reportMonth && m.year === reportYear
      );
      
      if (monthEntry) {
        monthEntry.count++;
      }
    });
    
    return {
      totalReports: reports.length,
      typeData,
      monthlyData
    };
  }, [reports]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Reports Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reports</h2>
            <p className="mt-1 text-3xl font-semibold text-gray-800 dark:text-white">{stats.totalReports}</p>
          </div>
        </div>
      </div>
      
      {/* Monthly Reports Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          <h2 className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">Reports by Month</h2>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.monthlyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '0.5rem',
                  color: 'white'
                }} 
                labelStyle={{ color: 'white' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stats.monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#3B82F6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Report Types Pie Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <Database className="h-5 w-5 text-purple-500 dark:text-purple-400" />
          <h2 className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">Report Types</h2>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.typeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={40}
                paddingAngle={2}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {stats.typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '0.5rem',
                  color: 'white'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}