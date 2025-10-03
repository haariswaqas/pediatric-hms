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

export default function BloodPressureChart({ data }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const systolic = payload.find(p => p.dataKey === 'systolic')?.value;
      const diastolic = payload.find(p => p.dataKey === 'diastolic')?.value;
      
      // Pediatric BP ranges (simplified - age 5-12)
      const isSystolicNormal = systolic >= 90 && systolic <= 110;
      const isDiastolicNormal = diastolic >= 50 && diastolic <= 70;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{`Time: ${label}`}</p>
          <div className="space-y-1">
            <p className={`font-medium ${isSystolicNormal ? 'text-green-600' : 'text-red-600'}`}>
              Systolic: {systolic} mmHg
              {!isSystolicNormal && <span className="ml-2 text-xs">(⚠️)</span>}
            </p>
            <p className={`font-medium ${isDiastolicNormal ? 'text-green-600' : 'text-red-600'}`}>
              Diastolic: {diastolic} mmHg
              {!isDiastolicNormal && <span className="ml-2 text-xs">(⚠️)</span>}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Pediatric Normal: 90-110 / 50-70 mmHg
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
          Blood Pressure (mmHg)
        </h4>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Systolic</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Diastolic</span>
          </div>
        </div>
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
          <Legend />
          
          {/* Normal range references */}
          <ReferenceLine y={90} stroke="#22c55e" strokeDasharray="5 5" strokeOpacity={0.6} />
          <ReferenceLine y={110} stroke="#22c55e" strokeDasharray="5 5" strokeOpacity={0.6} />
          <ReferenceLine y={50} stroke="#3b82f6" strokeDasharray="3 3" strokeOpacity={0.6} />
          <ReferenceLine y={70} stroke="#3b82f6" strokeDasharray="3 3" strokeOpacity={0.6} />
          
          <Line
            type="monotone"
            dataKey="systolic"
            name="Systolic"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4, fill: '#ef4444' }}
            activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="diastolic"
            name="Diastolic"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#3b82f6' }}
            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
