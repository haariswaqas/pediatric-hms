import React from 'react';

const AppointmentStatusBadge = ({ status }) => {
  const getBadgeClasses = () => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500';
    }
  };

  return (
    <span
      className={`px-3 py-1 text-sm font-semibold rounded-full border shadow-sm ${getBadgeClasses()}`}
      role="status"
      aria-label={`Appointment is ${status}`}
    >
      {status}
    </span>
  );
};

export default AppointmentStatusBadge;
