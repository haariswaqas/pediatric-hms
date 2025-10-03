import React, { useState } from 'react';
import { ChartArea, BarChart3, TrendingUp, Activity, Stethoscope, MoreHorizontal } from 'lucide-react';
import VitalLineChart from '../charts/VitalLineChart';
import VitalBarChart from '../charts/VitalBarChart';
import VitalAreaChart from '../charts/VitalAreaChart';
import BloodPressureChart from '../charts/BloodPressureChart';
import PainScoreChart from '../charts/PainScoreChart';

export default function VitalStats({ histories, childDetails }) {
  const [viewMode, setViewMode] = useState('line'); // 'line', 'bar', 'area', 'mixed'
  
  if (!histories || histories.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
        <Stethoscope className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400 text-lg">No vital signs data available for visualization</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Record some vital signs to see trends and patterns</p>
      </div>
    );
  }

  // Sort data chronologically
  const data = [...histories]
    .sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at))
    .map(vh => ({
      time: new Date(vh.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullTime: new Date(vh.updated_at).toLocaleString(),
      temperature: vh.temperature,
      heart_rate: vh.heart_rate,
      respiratory_rate: vh.respiratory_rate,
      oxygen_saturation: vh.oxygen_saturation,
      systolic: vh.systolic,
      diastolic: vh.diastolic,
      pain_score: vh.pain_score,
      glucose_level: vh.glucose_level
    }));

  // Pediatric normal ranges (simplified for demonstration)
  const normalRanges = {
    temperature: { min: 36.0, max: 37.5 },
    heart_rate: { min: 80, max: 120 },
    respiratory_rate: { min: 15, max: 25 },
    oxygen_saturation: { min: 95, max: 100 },
    glucose_level: { min: 70, max: 140 }
  };

  const chartConfigs = [
    {
      key: 'temperature',
      label: 'Temperature (°C)',
      color: '#ef4444',
      normalRange: normalRanges.temperature,
      icon: '🌡️'
    },
    {
      key: 'heart_rate',
      label: 'Heart Rate (bpm)',
      color: '#ec4899',
      normalRange: normalRanges.heart_rate,
      icon: '💗'
    },
    {
      key: 'respiratory_rate',
      label: 'Respiratory Rate (/min)',
      color: '#06b6d4',
      normalRange: normalRanges.respiratory_rate,
      icon: '🫁'
    },
    {
      key: 'oxygen_saturation',
      label: 'Oxygen Saturation (%)',
      color: '#3b82f6',
      normalRange: normalRanges.oxygen_saturation,
      icon: '🩸'
    },
    {
      key: 'glucose_level',
      label: 'Glucose Level (mg/dL)',
      color: '#8b5cf6',
      normalRange: normalRanges.glucose_level,
      icon: '🍭'
    }
  ];

  const ViewModeButton = ({ mode, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-500 text-white shadow-md'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const getAgeGroup = () => {
    if (!childDetails?.age) return 'child';
    const age = childDetails.age;
    if (age < 2) return 'infant';
    if (age < 6) return 'toddler';
    if (age < 12) return 'child';
    return 'adolescent';
  };

  return (
    <div className="space-y-6">
      {/* Header with patient info and controls */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-pink-100 dark:border-gray-600">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
              {childDetails?.gender?.toLowerCase() === 'female' ? '👧' : '👦'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {childDetails?.child || 'Patient'}'s Vital Signs Trends
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {childDetails?.age ? `Age: ${childDetails.age} years` : ''} • 
                {getAgeGroup().charAt(0).toUpperCase() + getAgeGroup().slice(1)} • 
                {data.length} readings
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <ViewModeButton
              mode="line"
              icon={TrendingUp}
              label="Line"
              isActive={viewMode === 'line'}
              onClick={() => setViewMode('line')}
            />
            <ViewModeButton
              mode="bar"
              icon={BarChart3}
              label="Bar"
              isActive={viewMode === 'bar'}
              onClick={() => setViewMode('bar')}
            />
            <ViewModeButton
              mode="area"
              icon={ChartArea}
              label="Area"
              isActive={viewMode === 'area'}
              onClick={() => setViewMode('area')}
            />
            <ViewModeButton
              mode="mixed"
              icon={Activity}
              label="Mixed"
              isActive={viewMode === 'mixed'}
              onClick={() => setViewMode('mixed')}
            />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Specialized Charts */}
        <div className="xl:col-span-2">
          <BloodPressureChart data={data} />
        </div>
        
        <PainScoreChart data={data} />

        {/* Individual Vital Charts */}
        {chartConfigs.map(({ key, label, color, normalRange, icon }) => {
          const ChartComponent = 
            viewMode === 'bar' ? VitalBarChart :
            viewMode === 'area' ? VitalAreaChart :
            VitalLineChart;

          return (
            <ChartComponent
              key={key}
              data={data}
              dataKey={key}
              label={`${icon} ${label}`}
              color={color}
              normalRange={normalRange}
            />
          );
        })}
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-blue-100 dark:border-gray-600">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Quick Summary
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {chartConfigs.map(({ key, label, icon }) => {
            const values = data.map(d => d[key]).filter(v => v != null);
            if (values.length === 0) return null;
            
            const latest = values[values.length - 1];
            const average = (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1);
            const trend = values.length > 1 ? 
              (latest > values[values.length - 2] ? '↗️' : latest < values[values.length - 2] ? '↘️' : '➡️') : '➡️';
            
            return (
              <div key={key} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                <div className="text-lg mb-1">{icon}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
                <div className="text-sm font-semibold text-gray-800 dark:text-white">
                  Latest: {latest} {trend}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  Avg: {average}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}