// src/children/components/AgeDistribution.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AgeDistribution({ children }) {
  // Prepare data - group by age ranges
  const ageGroups = {
    '0-2': 0,
    '3-5': 0,
    '6-8': 0,
    '9-12': 0,
    '13-15': 0,
    '16-18': 0
  };
  
  children.forEach(child => {
    const age = parseInt(child.age);
    if (age >= 0 && age <= 2) ageGroups['0-2']++;
    else if (age >= 3 && age <= 5) ageGroups['3-5']++;
    else if (age >= 6 && age <= 8) ageGroups['6-8']++;
    else if (age >= 9 && age <= 12) ageGroups['9-12']++;
    else if (age >= 13 && age <= 15) ageGroups['13-15']++;
    else if (age >= 16 && age <= 18) ageGroups['16-18']++;
  });
  
  const data = Object.entries(ageGroups).map(([range, count]) => ({
    range,
    count
  }));
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} patients`, 'Count']} />
          <Bar dataKey="count" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}