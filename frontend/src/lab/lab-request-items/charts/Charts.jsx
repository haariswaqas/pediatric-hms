import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export default function Charts({ labRequestItems }) {
    // Status distribution data
    const getStatusData = () => {
        const statusCounts = {
            ORDERED: 0,
            PROCESSING: 0,
            COMPLETED: 0,
            COLLECTED: 0,
            CANCELLED: 0,
            REJECTED: 0,
            VERIFIED: 0
        };

        labRequestItems.forEach(item => {
            const status = item.lab_request_details?.status || item.status;
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            }
        });

        return Object.entries(statusCounts).map(([status, count]) => ({
            status: status.charAt(0) + status.slice(1).toLowerCase(),
            count,
            fill: getStatusColor(status)
        }));
    };

    // Priority distribution data
    const getPriorityData = () => {
        const priorityCounts = { URGENT: 0, STAT: 0, ROUTINE: 0 };

        labRequestItems.forEach(item => {
            const priority = (item.lab_request_details?.priority || 'nothing is here').toUpperCase();
            if (priorityCounts.hasOwnProperty(priority)) {
                priorityCounts[priority]++;
            }
        });

        return Object.entries(priorityCounts).map(([priority, count]) => ({
            priority: priority.charAt(0) + priority.slice(1).toLowerCase(),
            count,
            fill: getPriorityColor(priority)
        }));
    };

    // Weekly trend data
    const getWeeklyTrendData = () => {
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            last7Days.push({
                date: date.toISOString().split('T')[0],
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                requests: 0
            });
        }

        labRequestItems.forEach(item => {
            const requestDate = item.lab_request_details?.date_requested;
            if (requestDate) {
                const itemDate = new Date(requestDate).toISOString().split('T')[0];
                const dayData = last7Days.find(day => day.date === itemDate);
                if (dayData) {
                    dayData.requests++;
                }
            }
        });

        return last7Days;
    };

    // Sample type distribution
    const getSampleTypeData = () => {
        const sampleCounts = {};

        labRequestItems.forEach(item => {
            const sampleType = item.lab_test_details?.sample_type || 'Unknown';
            sampleCounts[sampleType] = (sampleCounts[sampleType] || 0) + 1;
        });

        return Object.entries(sampleCounts).map(([type, count]) => ({
            type,
            count,
            fill: getSampleTypeColor(type)
        }));
    };

    const getStatusColor = (status) => {
        const colors = {
            ORDERED: '#3B82F6',
            PROCESSING: '#F59E0B',
            COMPLETED: '#10B981',
            COLLECTED: '#8B5CF6',
            CANCELLED: '#EF4444',
            REJECTED: '#DC2626',
            VERIFIED: '#059669'
        };
        return colors[status] || '#6B7280';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            URGENT: '#EF4444',
            STAT: '#F59E0B',
            ROUTINE: '#10B981'
        };
        return colors[priority] || '#6B7280';
    };

    const getSampleTypeColor = (type) => {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16'];
        const index = type.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const statusData = getStatusData();
    const priorityData = getPriorityData();
    const weeklyData = getWeeklyTrendData();
    const sampleTypeData = getSampleTypeData();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <p className="text-gray-900 dark:text-white font-medium">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Request Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis 
                            dataKey="status" 
                            stroke="#6B7280"
                            fontSize={12}
                        />
                        <YAxis 
                            stroke="#6B7280"
                            fontSize={12}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Priority Distribution Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Priority Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={priorityData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ priority, count, percent }) => 
                                `${priority} (${(percent * 100).toFixed(0)}%)`
                            }
                            outerRadius={80}
                            dataKey="count"
                        />
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Weekly Trend Line Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Weekly Request Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis 
                            dataKey="day" 
                            stroke="#6B7280"
                            fontSize={12}
                        />
                        <YAxis 
                            stroke="#6B7280"
                            fontSize={12}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                            type="monotone" 
                            dataKey="requests" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Sample Type Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Sample Type Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sampleTypeData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis 
                            type="number"
                            stroke="#6B7280"
                            fontSize={12}
                        />
                        <YAxis 
                            dataKey="type" 
                            type="category"
                            stroke="#6B7280"
                            fontSize={12}
                            width={100}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}