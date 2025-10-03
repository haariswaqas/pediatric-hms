// src/prescriptions/prescription-items/components/PrescriptionFilterBar.jsx

import React from "react";
import { Filter } from "lucide-react";

export default function PrescriptionFilterBar({
  filterStatus,
  onFilterChange,
  totalCount,
  filteredCount,
}) {
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "ACTIVE", label: "Active" },
    { value: "PENDING", label: "Pending" },
    { value: "EXPIRED", label: "Expired" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center">
        <Filter className="h-5 w-5 text-gray-400 mr-2" />
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="ml-0 md:ml-2 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
        Showing <span className="font-medium text-gray-900 dark:text-white">{filteredCount}</span>
        {filteredCount !== totalCount && (
          <> of <span className="font-medium text-gray-900 dark:text-white">{totalCount}</span></>
        )}
      </div>
    </div>
  );
}