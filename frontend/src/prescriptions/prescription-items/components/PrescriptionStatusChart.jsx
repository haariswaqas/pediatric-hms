// src/prescriptions/prescription-items/components/PrescriptionStatusChart.jsx

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { CheckCircle2 } from "lucide-react";

export default function PrescriptionStatusChart({ data }) {
  // Colors for different statuses
  const COLORS = {
    ACTIVE: "#22c55e", // green-500
    PENDING: "#f59e0b", // amber-500
    EXPIRED: "#ef4444", // red-500
    CANCELLED: "#6b7280", // gray-500
    COMPLETED: "#3b82f6", // blue-500
    unknown: "#a1a1aa", // zinc-400
  };

  const getStatusColor = (status) => {
    return COLORS[status] || COLORS.unknown;
  };
  
  // Generate colors array based on data
  const colors = data.map(item => getStatusColor(item.name));

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 shadow-md rounded border border-gray-200 dark:border-gray-700">
          <p className="font-medium">{payload[0].name}: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center mb-4">
        <CheckCircle2 className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Prescription Status
        </h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}