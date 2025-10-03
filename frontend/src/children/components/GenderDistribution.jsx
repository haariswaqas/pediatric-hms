// src/children/components/GenderDistribution.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function GenderDistribution({ children }) {
  // Prepare data
  const maleCount = children.filter(c => c.gender === 'M').length;
  const femaleCount = children.filter(c => c.gender === 'F').length;
  const otherCount = children.filter(c => c.gender !== 'M' && c.gender !== 'F').length;
  
  const data = [
    { name: 'Male', value: maleCount },
    { name: 'Female', value: femaleCount }
  ];
  
  if (otherCount > 0) {
    data.push({ name: 'Other', value: otherCount });
  }
  
  const COLORS = ['#3B82F6', '#EC4899', '#8B5CF6'];
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} patients`, 'Count']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}