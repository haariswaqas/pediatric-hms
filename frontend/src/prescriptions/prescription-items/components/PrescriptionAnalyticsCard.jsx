// src/prescriptions/prescription-items/components/PrescriptionAnalyticsCard.jsx

import React from "react";

export default function PrescriptionAnalyticsCard({ title, value, icon, color }) {
  const getColorClasses = () => {
    const colorMap = {
      indigo: {
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        text: "text-indigo-600 dark:text-indigo-400",
        iconBg: "bg-indigo-100 dark:bg-indigo-800/40",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-900/20",
        text: "text-green-600 dark:text-green-400",
        iconBg: "bg-green-100 dark:bg-green-800/40",
      },
      amber: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        text: "text-amber-600 dark:text-amber-400",
        iconBg: "bg-amber-100 dark:bg-amber-800/40",
      },
      red: {
        bg: "bg-red-50 dark:bg-red-900/20",
        text: "text-red-600 dark:text-red-400",
        iconBg: "bg-red-100 dark:bg-red-800/40",
      },
    };

    return colorMap[color] || colorMap.indigo;
  };

  const colors = getColorClasses();

  return (
    <div className={`rounded-lg shadow-sm p-4 ${colors.bg}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${colors.text}`}>
            {value}
          </p>
        </div>
        <div className={`rounded-full p-2 ${colors.iconBg}`}>
          {React.cloneElement(icon, {
            className: `w-5 h-5 ${colors.text}`
          })}
        </div>
      </div>
    </div>
  );
}