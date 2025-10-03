import React from "react";

export const ActionButton = ({ label, icon, onClick, isDanger = false, badge = 0, isActive = false }) => (
  <button
    onClick={onClick}
    className={`
      relative flex flex-col items-center justify-center
      h-32 rounded-lg shadow-md transition-all 
      hover:shadow-lg hover:translate-y-px 
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
      ${isDanger
        ? 'bg-red-500 text-white hover:bg-red-600'
        : isActive
          ? 'bg-blue-50 dark:bg-blue-900 border-2 border-blue-500 dark:border-blue-400'
          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
      }
    `}
    aria-label={label}
  >
    <div className="mb-2 relative">
      {React.cloneElement(icon, { size: 28 })}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full" aria-label={`${badge} unread notifications`}>
          {badge}
        </span>
      )}
    </div>
    <span className="font-medium text-center text-sm px-2">{label}</span>
  </button>
);