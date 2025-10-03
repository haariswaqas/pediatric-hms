// Component for a reusable card
import React from "react";
export const Card = ({ children, className = "" }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );