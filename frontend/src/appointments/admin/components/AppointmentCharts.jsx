import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const AppointmentCharts = ({ appointments }) => {
  // Process data for status distribution chart
  const statusData = useMemo(() => {
    const statusCounts = appointments.reduce((acc, appt) => {
      acc[appt.status] = (acc[appt.status] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status]
    }));
  }, [appointments]);

  // Process data for appointments by doctor chart
  const doctorData = useMemo(() => {
    const doctorCounts = appointments.reduce((acc, appt) => {
      const doctorName = `${appt.doctor_details.first_name} ${appt.doctor_details.last_name}`;
      acc[doctorName] = (acc[doctorName] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(doctorCounts)
      .map(doctor => ({
        name: doctor,
        appointments: doctorCounts[doctor]
      }))
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 5); // Top 5 doctors
  }, [appointments]);

  // Colors for the pie chart
  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366F1'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Appointment Analytics</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">Status Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, 'Appointments']}
                  labelFormatter={(label) => `Status: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">Appointments by Doctor</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={doctorData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={false} />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} appointments`, 'Total']}
                  labelFormatter={(label) => `Dr. ${label}`}
                />
                <Legend />
                <Bar dataKey="appointments" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCharts;