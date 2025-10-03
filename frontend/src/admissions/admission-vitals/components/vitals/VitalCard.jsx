import React from 'react';
import StatusBadge from '../utils/StatusBadge';
import { TrendingUp } from 'lucide-react';

export default function VitalCard({ icon: Icon, label, value, unit, status, trend }) {
  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow
        dark:bg-gray-800 dark:border-gray-700
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {label}
          </span>
        </div>
        {trend != null && (
          <TrendingUp
            className={`
              w-4 h-4
              ${trend > 0
                ? 'text-red-500 dark:text-red-300'
                : 'text-green-500 dark:text-green-300'}
            `}
          />
        )}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value ?? '--'}
          </span>
          {unit && (
            <span className="text-sm text-gray-500 ml-1 dark:text-gray-400">
              {unit}
            </span>
          )}
        </div>
        <StatusBadge status={status}>
          {status === 'normal' ? '✓' : '⚠'}
        </StatusBadge>
      </div>
    </div>
  );
}
