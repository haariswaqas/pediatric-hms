import React from 'react';

export default function StatusBadge({ status, children }) {
  const colors = {
    normal: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-800 dark:text-green-100 dark:border-green-700',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-800 dark:text-yellow-100 dark:border-yellow-700',
    critical: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-800 dark:text-red-100 dark:border-red-700',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
        ${colors[status]}
      `}
    >
      {children}
    </span>
  );
}
