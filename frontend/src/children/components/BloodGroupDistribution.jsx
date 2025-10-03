// src/children/components/BloodGroupDistribution.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function BloodGroupDistribution({ children }) {
  // Prepare data
  const bloodGroups = {};
  
  children.forEach(child => {
    const bloodGroup = child.blood_group || 'Unknown';
    bloodGroups[bloodGroup] = (bloodGroups[bloodGroup] || 0) + 1;
  });
  
  const data = Object.entries(bloodGroups).map(([name, value]) => ({
    name,
    value
  }));
  
  const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} patients`, 'Count']} />
          <Legend layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}