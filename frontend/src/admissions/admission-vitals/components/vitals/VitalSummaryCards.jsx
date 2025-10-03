import React from 'react';
import { Thermometer, Heart, Activity, Droplets, Gauge, Brain } from 'lucide-react';
import VitalCard from './VitalCard';
import { getVitalStatus } from '../utils/getVitalStatus';

export default function VitalSummaryCards({ latestVitals, patientAge }) {
  const vitals = [
    { icon: Thermometer, label: 'Temperature', value: latestVitals?.temperature, unit: '°C', type: 'temperature' },
    { icon: Heart, label: 'Heart Rate', value: latestVitals?.heart_rate, unit: 'bpm', type: 'heart_rate' },
    { icon: Activity, label: 'Respiratory Rate', value: latestVitals?.respiratory_rate, unit: '/min', type: 'respiratory_rate' },
    { icon: Droplets, label: 'O₂ Saturation', value: latestVitals?.oxygen_saturation, unit: '%', type: 'oxygen_saturation' },
    { icon: Gauge, label: 'Blood Pressure', value: latestVitals?.systolic && latestVitals?.diastolic ? `${latestVitals.systolic}/${latestVitals.diastolic}` : null, unit: 'mmHg', type: 'systolic' },
    { icon: Brain, label: 'Pain Score', value: latestVitals?.pain_score, unit: '/10', type: 'pain_score' },
  ];

  return (
    <div
      className={`
        grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6
        dark:bg-gray-900
      `}
    >
      {vitals.map((vital, i) => (
        <VitalCard
          key={i}
          icon={vital.icon}
          label={vital.label}
          value={vital.value}
          unit={vital.unit}
          status={getVitalStatus(vital.value, vital.type, patientAge)}
        />
      ))}
    </div>
  );
}
