// src/logging/SystemLogAnalytics.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSystemLogs } from '../../store/admin/systemLogSlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  Calendar,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
  Clock,
  LayoutGrid,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function SystemLogAnalytics() {
  const dispatch = useDispatch();
  const { logs, loading, error } = useSelector((state) => state.systemLogs);
  const [timeRange, setTimeRange] = useState('day');
  const [activeChart, setActiveChart] = useState('overview');

  // Load logs if not already loaded
  useEffect(() => {
    if (!loading && logs.length === 0 && !error) {
      dispatch(fetchSystemLogs());
    }
  }, [dispatch, logs.length, loading, error]);

  // Define chart colors
  const COLORS = {
    ERROR: '#ef4444',
    WARNING: '#f59e0b',
    INFO: '#3b82f6',
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#8b5cf6',
    light: '#f3f4f6',
    dark: '#1f2937'
  };

  // Calculate time-based filters based on selected range
  const getTimeFilter = () => {
    const now = new Date();
    switch (timeRange) {
      case 'day':
        return new Date(now.setDate(now.getDate() - 1));
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(0); // Beginning of time
    }
  };

  // Filter logs based on time range
  const filteredLogs = useMemo(() => {
    if (!Array.isArray(logs) || logs.length === 0) return [];
    
    const timeFilter = getTimeFilter();
    return logs.filter(log => new Date(log.timestamp) >= timeFilter);
  }, [logs, timeRange]);

  // Generate data for log level distribution
  const logLevelData = useMemo(() => {
    if (filteredLogs.length === 0) return [];
    
    const counts = { ERROR: 0, WARNING: 0, INFO: 0 };
    filteredLogs.forEach(log => {
      if (log.level in counts) {
        counts[log.level]++;
      }
    });
    
    return Object.keys(counts)
      .filter(level => counts[level] > 0) // Only include levels with data
      .map(level => ({
        name: level,
        value: counts[level]
      }));
  }, [filteredLogs]);

  // Generate data for log trends over time
  const logTrendData = useMemo(() => {
    if (filteredLogs.length === 0) return [];
    
    // Get appropriate time grouping based on range
    const getGroupKey = (date) => {
      const d = new Date(date);
      switch (timeRange) {
        case 'day':
          return `${d.getHours()}:00`;
        case 'week':
          return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
        case 'month':
          return `${d.getDate()}/${d.getMonth() + 1}`;
        case 'year':
          return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
        default:
          return `${d.getDate()}/${d.getMonth() + 1}`;
      }
    };

    // Group logs by time and level
    const grouped = {};
    filteredLogs.forEach(log => {
      const key = getGroupKey(log.timestamp);
      if (!grouped[key]) {
        grouped[key] = { name: key, ERROR: 0, WARNING: 0, INFO: 0, total: 0 };
      }
      grouped[key][log.level]++;
      grouped[key].total++;
    });

    // Convert to array and sort chronologically
    return Object.values(grouped).sort((a, b) => {
      // Simple sort for hour format (day view)
      if (timeRange === 'day') {
        return parseInt(a.name) - parseInt(b.name);
      }
      
      // For other formats, we'll use the original order (which should be chronological)
      return 0;
    });
  }, [filteredLogs, timeRange]);

  // Generate data for user activity
  const userActivityData = useMemo(() => {
    if (filteredLogs.length === 0) return [];
    
    const userCounts = {};
    filteredLogs.forEach(log => {
      const user = log.user || 'System';
      userCounts[user] = (userCounts[user] || 0) + 1;
    });

    // Sort by count and take top 5
    return Object.entries(userCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredLogs]);

  // Generate hourly distribution data
  const hourlyDistributionData = useMemo(() => {
    if (filteredLogs.length === 0) return [];
    
    const hours = Array(24).fill().map((_, i) => ({ 
      hour: i, 
      name: `${i}:00`, 
      count: 0 
    }));
    
    filteredLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hours[hour].count++;
    });
    
    return hours;
  }, [filteredLogs]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded shadow">
        <div className="flex items-center space-x-2">
          <AlertCircle className="text-red-500" />
          <span className="font-medium text-red-800">Error: {error}</span>
        </div>
        <button
          onClick={() => dispatch(fetchSystemLogs())}
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!Array.isArray(logs) || logs.length === 0) {
    return (
      <div className="p-8 text-center">
        <BarChart2 size={32} className="mx-auto text-gray-400" />
        <p className="mt-2 text-gray-500">No system logs available</p>
        <button
          onClick={() => dispatch(fetchSystemLogs())}
          className="mt-4 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (filteredLogs.length === 0) {
    return (
      <div className="p-8 text-center">
        <BarChart2 size={32} className="mx-auto text-gray-400" />
        <p className="mt-2 text-gray-500">No log data available for the selected time period</p>
        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={() => setTimeRange('all')}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded"
          >
            View All Time
          </button>
          <button
            onClick={() => dispatch(fetchSystemLogs())}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="border-b dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <h2 className="text-xl font-bold dark:text-white">System Log Analytics</h2>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <div className="flex items-center space-x-1 text-sm">
              <Calendar size={16} />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-1"
              >
                <option value="day">Last 24 hours</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="year">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>
            <button
              onClick={() => dispatch(fetchSystemLogs())}
              title="Refresh"
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Chart type selector */}
        <div className="flex space-x-1 mt-4 border-b dark:border-gray-700 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveChart('overview')}
            className={`px-3 py-2 rounded-t flex items-center space-x-1 text-sm ${
              activeChart === 'overview'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200 border-b-2 border-blue-500'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <LayoutGrid size={14} className='dark:text-white' />
            <span className='dark:text-white'>Overview</span>
          </button>
          <button
            onClick={() => setActiveChart('levelDistribution')}
            className={`px-3 py-2 rounded-t flex items-center space-x-1 text-sm ${
              activeChart === 'levelDistribution'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200 border-b-2 border-blue-500'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <PieChartIcon size={14}  className='dark:text-white' />
            <span className='dark:text-white'>Log Levels</span>
          </button>
          <button
            onClick={() => setActiveChart('timeTrend')}
            className={`px-3 py-2 rounded-t flex items-center space-x-1 text-sm ${
              activeChart === 'timeTrend'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200 border-b-2 border-blue-500'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <TrendingUp size={14}   className='dark:text-white' />
            <span className='dark:text-white'>Time Trends</span>
          </button>
          <button
            onClick={() => setActiveChart('userActivity')}
            className={`px-3 py-2 rounded-t flex items-center space-x-1 text-sm ${
              activeChart === 'userActivity'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200 border-b-2 border-blue-500'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <BarChart2 size={14}    className='dark:text-white' />
            <span className='dark:text-white'>User Activity</span>
          </button>
          <button
            onClick={() => setActiveChart('hourlyDistribution')}
            className={`px-3 py-2 rounded-t flex items-center space-x-1 text-sm ${
              activeChart === 'hourlyDistribution'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200 border-b-2 border-blue-500'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Clock size={14} className='dark:text-white' />
            <span className='dark:text-white'>Time of Day</span>
          </button>
        </div>
      </div>
      
      {/* Chart area */}
      <div className="p-4">
        {activeChart === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-sm text-gray-500 dark:text-white">Total Logs</h3>
                <p className="text-2xl font-bold dark:text-white">{filteredLogs.length}</p>
                <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                  {timeRange === 'all' ? 'All time' : `Last ${timeRange === 'day' ? '24 hours' : timeRange}`}
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">Errors</h3>
                <p className="text-2xl font-bold dark:text-white">
                  {filteredLogs.filter(log => log.level === 'ERROR').length}
                </p>
                <div className="mt-2 text-sm text-red-600 dark:text-red-400 ">
                  {filteredLogs.length > 0 
                    ? ((filteredLogs.filter(log => log.level === 'ERROR').length / filteredLogs.length) * 100).toFixed(1)
                    : '0'}% of total
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">Warnings</h3>
                <p className="text-2xl font-bold dark:text-white">
                  {filteredLogs.filter(log => log.level === 'WARNING').length}
                </p>
                <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                  {filteredLogs.length > 0
                    ? ((filteredLogs.filter(log => log.level === 'WARNING').length / filteredLogs.length) * 100).toFixed(1)
                    : '0'}% of total
                </div>
              </div>
            </div>

            {/* Log level mini pie chart */}
            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-4 dark:text-white">Log Level Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={logLevelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {logLevelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Log trend mini chart */}
            <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-4 dark:text-white">Log Activity Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={logTrendData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="INFO" 
                      stackId="1"
                      stroke={COLORS.INFO} 
                      fill={COLORS.INFO} 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="WARNING" 
                      stackId="1"
                      stroke={COLORS.WARNING} 
                      fill={COLORS.WARNING} 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ERROR" 
                      stackId="1"
                      stroke={COLORS.ERROR} 
                      fill={COLORS.ERROR} 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {activeChart === 'levelDistribution' && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={logLevelData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {logLevelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} logs`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {activeChart === 'timeTrend' && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={logTrendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ERROR" 
                  stroke={COLORS.ERROR} 
                  strokeWidth={2}
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="WARNING" 
                  stroke={COLORS.WARNING} 
                  strokeWidth={2} 
                />
                <Line 
                  type="monotone" 
                  dataKey="INFO" 
                  stroke={COLORS.INFO} 
                  strokeWidth={2} 
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke={COLORS.primary} 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {activeChart === 'userActivity' && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={userActivityData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Log Count" fill={COLORS.accent} />
              </BarChart>
            </ResponsiveContainer>
            {userActivityData.length > 0 && (
              <div className="mt-4 text-sm text-gray-500 text-center">
                Top {userActivityData.length} users by log activity
              </div>
            )}
          </div>
        )}
        
        {activeChart === 'hourlyDistribution' && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hourlyDistributionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip labelFormatter={(value) => `Hour: ${value}`} />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Log Count" 
                  fill={COLORS.primary} 
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-500 text-center">
              Distribution of logs by hour of day
            </div>
          </div>
        )}
      </div>
    </div>
  );
}