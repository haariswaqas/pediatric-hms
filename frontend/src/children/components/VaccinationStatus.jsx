// src/children/components/VaccinationStatus.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function VaccinationStatus({ children }) {
  // Process vaccination status data
  const statusCategories = {
    'Complete': 0,
    'Partial': 0,
    'Pending': 0,
    'Exempt': 0,
    'Unknown': 0
  };
  
  children.forEach(child => {
    const status = child.vaccination_status || '';
    if (!status) {
      statusCategories['Unknown']++;
    } else if (status.toLowerCase().includes('complete')) {
      statusCategories['Complete']++;
    } else if (status.toLowerCase().includes('partial')) {
      statusCategories['Partial']++;
    } else if (status.toLowerCase().includes('exempt')) {
      statusCategories['Exempt']++;
    } else if (status.toLowerCase().includes('pending')) {
      statusCategories['Pending']++;
    } else {
      statusCategories['Unknown']++;
    }
  });
  
  const data = Object.entries(statusCategories).map(([name, value]) => ({
    name,
    value
  }));
  
  const colors = {
    'Complete': '#10B981',
    'Partial': '#F59E0B',
    'Pending': '#3B82F6',
    'Exempt': '#EF4444',
    'Unknown': '#6B7280'
  };
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 60,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" />
          <Tooltip formatter={(value) => [`${value} patients`]} />
          <Legend />
          <Bar dataKey="value" name="Patients">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[entry.name]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}