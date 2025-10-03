// src/shifts/components/ShiftAssignmentFilters.jsx
import React from 'react';
import { Search, Filter, ChevronUp, ChevronDown } from 'lucide-react';

/**
 * Reusable filters component for shift assignments
 * @param {Object} props
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.setSearchTerm - Function to update search term
 * @param {string} props.filterDay - Currently selected day filter
 * @param {Function} props.setFilterDay - Function to update day filter
 * @param {Array} props.uniqueDays - Array of unique days for filtering
 * @param {string} props.sortField - Current sort field
 * @param {Function} props.setSortField - Function to update sort field
 * @param {string} props.sortDirection - Current sort direction (asc/desc)
 * @param {Function} props.setSortDirection - Function to update sort direction
 * @param {boolean} props.showStats - Whether stats are visible
 * @param {Function} props.setShowStats - Function to toggle stats visibility
 * @param {Array} props.roleNameSingular - Singular form of role name (doctor, nurse)
 */
export default function ShiftAssignmentFilters({
  searchTerm,
  setSearchTerm,
  filterDay,
  setFilterDay,
  uniqueDays,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  showStats,
  setShowStats,
  roleNameSingular
}) {
  // Handle sorting logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Capitalize for display
  const displayRole = roleNameSingular.charAt(0).toUpperCase() + roleNameSingular.slice(1);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Search */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={`Search ${roleNameSingular}s...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-gray-100 h-10"
          />
        </div>

        {/* Day filter */}
        <div className="w-full md:w-64">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-gray-400" />
            </div>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-gray-100 h-10"
            >
              <option value="">All days</option>
              {uniqueDays.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400">
        <span className="mr-2">Sort by:</span>
        <button
          className={`mr-4 flex items-center ${sortField === 'name' ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}
          onClick={() => handleSort('name')}
        >
          {displayRole} Name
          {sortField === 'name' && (
            sortDirection === 'asc' ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />
          )}
        </button>
        <button
          className={`mr-4 flex items-center ${sortField === 'shifts' ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}
          onClick={() => handleSort('shifts')}
        >
          Number of Shifts
          {sortField === 'shifts' && (
            sortDirection === 'asc' ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />
          )}
        </button>

        <div className="ml-auto">
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
          >
            {showStats ? 'Hide Statistics' : 'Show Statistics'}
            {showStats ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
}
