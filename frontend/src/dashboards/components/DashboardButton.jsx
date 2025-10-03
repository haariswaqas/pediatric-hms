import React from "react";
import { useNavigate } from "react-router-dom";

export const DashboardButton = ({ icon, label, color, onClick, badgeCount, navigateTo }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (navigateTo) {
      navigate(navigateTo);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative flex flex-col items-center justify-center
        h-32 rounded-lg shadow-md transition-all 
        hover:shadow-lg hover:translate-y-px 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        ${color}
      `}
      aria-label={label}
    >
      <div className="mb-2 relative">
        {React.cloneElement(icon, { size: 28 })}
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg" aria-label={`${badgeCount} unread notifications`}>
            {badgeCount}
          </span>
        )}
      </div>
      <span className="font-medium text-center text-sm px-2">{label}</span>
    </button>
  );
};