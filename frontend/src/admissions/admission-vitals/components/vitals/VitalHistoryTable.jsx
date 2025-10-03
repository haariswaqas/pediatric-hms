import React from 'react';
import StatusBadge from '../utils/StatusBadge';
import { Clock, Thermometer, Heart, Activity, Droplets, User } from 'lucide-react';
import { getVitalStatus } from '../utils/getVitalStatus';

export default function VitalHistoryTable({ histories, patientAge }) {
  return (
    <div
      className={`
        overflow-x-auto bg-white rounded-lg border border-gray-200
        dark:bg-gray-800 dark:border-gray-700
      `}
    >
      <table className="w-full text-sm">
        <thead
          className={`
            bg-gray-50
            dark:bg-gray-700
          `}
        >
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 dark:text-gray-300" />
                <span>Date &amp; Time</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center space-x-1">
                <Thermometer className="w-4 h-4 dark:text-gray-300" />
                <span>Temp (°C)</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 dark:text-gray-300" />
                <span>HR (bpm)</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
              BP (mmHg)
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center space-x-1">
                <Activity className="w-4 h-4 dark:text-gray-300" />
                <span>RR (/min)</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center space-x-1">
                <Droplets className="w-4 h-4 dark:text-gray-300" />
                <span>O₂ Sat (%)</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
              Additional Vitals
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4 dark:text-gray-300" />
                <span>Recorded By</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {histories.map(vh => (
            <tr
              key={vh.id}
              className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-700"
            >
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(vh.updated_at).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(vh.updated_at).toLocaleTimeString()}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {vh.temperature ?? '--'}
                  </span>
                  {vh.temperature != null && (
                    <StatusBadge status={getVitalStatus(vh.temperature, 'temperature', patientAge)}>
                      {getVitalStatus(vh.temperature, 'temperature', patientAge) === 'normal' ? '✓' : '⚠'}
                    </StatusBadge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {vh.heart_rate ?? '--'}
                  </span>
                  {vh.heart_rate != null && (
                    <StatusBadge status={getVitalStatus(vh.heart_rate, 'heart_rate', patientAge)}>
                      {getVitalStatus(vh.heart_rate, 'heart_rate', patientAge) === 'normal' ? '✓' : '⚠'}
                    </StatusBadge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {vh.systolic && vh.diastolic ? `${vh.systolic}/${vh.diastolic}` : '--'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {vh.respiratory_rate ?? '--'}
                  </span>
                  {vh.respiratory_rate != null && (
                    <StatusBadge status={getVitalStatus(vh.respiratory_rate, 'respiratory_rate', patientAge)}>
                      {getVitalStatus(vh.respiratory_rate, 'respiratory_rate', patientAge) === 'normal' ? '✓' : '⚠'}
                    </StatusBadge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {vh.oxygen_saturation ?? '--'}
                  </span>
                  {vh.oxygen_saturation != null && (
                    <StatusBadge status={getVitalStatus(vh.oxygen_saturation, 'oxygen_saturation', patientAge)}>
                      {getVitalStatus(vh.oxygen_saturation, 'oxygen_saturation', patientAge) === 'normal' ? '✓' : '⚠'}
                    </StatusBadge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="space-y-1 text-xs text-gray-900 dark:text-gray-100">
                  {vh.head_circumference && <div>Head Circ: {vh.head_circumference}cm</div>}
                  {vh.capillary_refill && <div>Cap. Refill: {vh.capillary_refill}s</div>}
                  {vh.pain_score && (
                    <div className="flex items-center space-x-1">
                      <span>Pain:</span>
                      <StatusBadge status={getVitalStatus(vh.pain_score, 'pain_score', patientAge)}>
                        {vh.pain_score}/10
                      </StatusBadge>
                    </div>
                  )}
                  {vh.consciousness_level && <div>Consciousness: {vh.consciousness_level}</div>}
                  {vh.glucose_level && <div>Glucose: {vh.glucose_level}</div>}
                  {vh.hydration_status && <div>Hydration: {vh.hydration_status}</div>}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div
                    className={`
                      w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center
                      dark:bg-gray-700
                    `}
                  >
                    <User className="w-4 h-4 text-blue-600 dark:text-gray-200" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {vh.updated_by_details
                        ? `${vh.updated_by_details.first_name} ${vh.updated_by_details.last_name}`
                        : 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Healthcare Provider
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
