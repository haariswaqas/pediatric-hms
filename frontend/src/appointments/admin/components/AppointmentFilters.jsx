import React from 'react';

const AppointmentFilters = ({ activeFilter, onFilterChange, stats }) => {
  const filters = [
    { id: 'ALL', label: 'All', count: stats.TOTAL },
    { id: 'CONFIRMED', label: 'Confirmed', count: stats.CONFIRMED },
    { id: 'PENDING', label: 'Pending', count: stats.PENDING },
    { id: 'CANCELLED', label: 'Cancelled', count: stats.CANCELLED },
    { id: 'COMPLETED', label: 'Completed', count: stats.COMPLETED }
  ];

  return (
    <div className="flex overflow-x-auto space-x-2 p-1">
      {filters.map(filter => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeFilter === filter.id
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {filter.label}
          <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
            activeFilter === filter.id
              ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
          }`}>
            {filter.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default AppointmentFilters;