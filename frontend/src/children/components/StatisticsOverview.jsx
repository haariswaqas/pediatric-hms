// src/children/components/StatisticsOverview.jsx
import React from 'react';
import { Users, User, BookOpen, Activity, Zap, Award } from 'lucide-react';

export default function StatisticsOverview({ children }) {
  // Calculate stats
  const totalPatients = children.length;
  const maleCount = children.filter(c => c.gender === 'M').length;
  const femaleCount = children.filter(c => c.gender === 'F').length;
  const averageAge = children.reduce((sum, child) => sum + parseInt(child.age || 0), 0) / (totalPatients || 1);
  const withAllergies = children.filter(c => c.allergies && c.allergies.trim() !== '').length;
  const fullyVaccinated = children.filter(c => c.vaccination_status && c.vaccination_status.toLowerCase().includes('complete')).length;
  const vaccinationPercentage = (fullyVaccinated / totalPatients) * 100 || 0;
  
  const stats = [
    {
      title: 'Total Patients',
      value: totalPatients,
      icon: <Users size={20} />,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Male',
      value: maleCount,
      icon: <User size={20} />,
      color: 'bg-indigo-100 text-indigo-800',
    },
    {
      title: 'Female',
      value: femaleCount,
      icon: <User size={20} />,
      color: 'bg-pink-100 text-pink-800',
    },
    {
      title: 'Average Age',
      value: `${averageAge.toFixed(1)} yrs`,
      icon: <BookOpen size={20} />,
      color: 'bg-yellow-100 text-yellow-800',
    },
   
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center">
          <div className={`p-3 rounded-full mr-4 ${stat.color}`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}