import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';

export default function PainScoreChart({ data }) {
  const getPainColor = (score) => {
    if (score <= 2) return '#22c55e'; // Green - mild
    if (score <= 5) return '#f59e0b'; // Yellow - moderate
    if (score <= 7) return '#f97316'; // Orange - severe
    return '#ef4444'; // Red - very severe
  };

  const getPainLevel = (score) => {
    if (score <= 2) return 'Mild 😊';
    if (score <= 5) return 'Moderate 😐';
    if (score <= 7) return 'Severe 😟';
    return 'Very Severe 😰';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-gray-600 dark:text-gray-300 text-sm">{`Time: ${label}`}</p>
          <div className="flex items-center gap-2 mt-1">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: getPainColor(score) }}
            ></div>
            <p className="font-medium text-gray-800 dark:text-gray-200">
              Pain Score: {score}/10
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Level: {getPainLevel(score)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
          Pain Assessment Score
        </h4>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">0-2</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">3-5</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">6-7</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">8-10</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis
            dataKey="time"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#9ca3af' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <Bar dataKey="pain_score" name="Pain Score" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getPainColor(entry.pain_score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}