import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

export default function VitalLineChart({ data, dataKey, label, color, normalRange }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isNormal = normalRange ? 
        value >= normalRange.min && value <= normalRange.max : true;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-gray-600 dark:text-gray-300 text-sm">{`Time: ${label}`}</p>
          <p className={`font-medium ${isNormal ? 'text-green-600' : 'text-red-600'}`}>
            {`${payload[0].name}: ${value}`}
            {!isNormal && <span className="ml-2 text-xs">(⚠️ Alert)</span>}
          </p>
          {normalRange && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Normal: {normalRange.min} - {normalRange.max}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
          {label}
        </h4>
        {normalRange && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
            Normal: {normalRange.min}-{normalRange.max}
          </span>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis
            dataKey="time"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#9ca3af' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {normalRange && (
            <>
              <ReferenceLine
                y={normalRange.min}
                stroke="#22c55e"
                strokeDasharray="5 5"
                strokeOpacity={0.6}
              />
              <ReferenceLine
                y={normalRange.max}
                stroke="#22c55e"
                strokeDasharray="5 5"
                strokeOpacity={0.6}
              />
            </>
          )}
          
          <Line
            type="monotone"
            dataKey={dataKey}
            name={label}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4, fill: color }}
            activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}