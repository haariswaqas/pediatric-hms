import React from 'react';
import { Baby, Calendar, Activity } from 'lucide-react';

export default function PatientHeader({ childName, admission_date, recordCount, patientAge }) {
  return (
    <div
      className={`
        bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200
        dark:from-gray-800 dark:to-gray-900 dark:border-gray-700
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`
              flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full
              dark:bg-gray-700
            `}
          >
            <Baby className="w-6 h-6 text-blue-600 dark:text-gray-200" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <span>{childName}</span>
              {patientAge != null && (
                <span
                  className={`
                    text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full
                    dark:bg-gray-700 dark:text-gray-200
                  `}
                >
                  Age: {patientAge}
                </span>
              )}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 dark:text-gray-300" />
                <span>Admitted: {new Date(admission_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="w-4 h-4 dark:text-gray-300" />
                <span>{recordCount} vital records</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
