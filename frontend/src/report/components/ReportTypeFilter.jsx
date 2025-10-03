import React, { useState } from 'react';
import { Filter } from 'lucide-react';

export default function ReportTypeFilter({ types, activeFilter, onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const handleFilterClick = (type) => {
    onFilterChange(type);
    setIsOpen(false); // close dropdown after selection
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
      >
        <Filter size={16} />
        <span>Filter: {activeFilter === 'all' ? 'All Types' : activeFilter}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 py-1">
          <div 
            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
              activeFilter === 'all' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
            }`}
            onClick={() => handleFilterClick('all')}
          >
            All Types
          </div>
          
          {types.map(type => (
            <div 
              key={type} 
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                activeFilter === type ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
              onClick={() => handleFilterClick(type)}
            >
              {type}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
