import React from 'react';
import StatCard from './StatCard';

const AppointmentStats = ({ stats }) => {
  console.log('Stats:', stats);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Total Appointments"
        value={stats.TOTAL}
        icon="calendar"
        colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
      />
      
      <StatCard 
        title="Confirmed"
        value={stats.CONFIRMED}
        icon="check-circle"
        colorClass="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
      />
      
      <StatCard 
        title="Pending"
        value={stats.PENDING}
        icon="clock"
        colorClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
      />
      
      <StatCard 
        title="Cancelled"
        value={stats.CANCELLED}
        icon="x-circle"
        colorClass="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
      />
         <StatCard 
        title="Completed"
        value={stats.COMPLETED}
        icon="check-square"
        colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
      />
    </div>
    

    
  );
};

export default AppointmentStats;