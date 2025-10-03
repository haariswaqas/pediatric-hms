// src/prescriptions/prescription-items/components/StatusBadge.jsx

import React from "react";

export default function PrescriptionStatusBadge({ status }) {
  const getStatusConfig = () => {
    const statusConfigs = {
      ACTIVE: {
        bgColor: "bg-green-100 dark:bg-green-900/20",
        textColor: "text-green-800 dark:text-green-300",
        dotColor: "bg-green-500"
      },
      PENDING: {
        bgColor: "bg-amber-100 dark:bg-amber-900/20",
        textColor: "text-amber-800 dark:text-amber-300",
        dotColor: "bg-amber-500"
      },
      EXPIRED: {
        bgColor: "bg-red-100 dark:bg-red-900/20",
        textColor: "text-red-800 dark:text-red-300",
        dotColor: "bg-red-500"
      },
      COMPLETED: {
        bgColor: "bg-blue-100 dark:bg-blue-900/20",
        textColor: "text-blue-800 dark:text-blue-300",
        dotColor: "bg-blue-500"
      },
      CANCELLED: {
        bgColor: "bg-gray-100 dark:bg-gray-800",
        textColor: "text-gray-800 dark:text-gray-300",
        dotColor: "bg-gray-500"
      },
      // Default/unknown status
      Unknown: {
        bgColor: "bg-gray-100 dark:bg-gray-800",
        textColor: "text-gray-800 dark:text-gray-300",
        dotColor: "bg-gray-500"
      }
    };

    return statusConfigs[status] || statusConfigs.Unknown;
  };

  const { bgColor, textColor, dotColor } = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      <span className={`w-2 h-2 mr-1.5 rounded-full ${dotColor}`}></span>
      {status || "Unknown"}
    </span>
  );
}