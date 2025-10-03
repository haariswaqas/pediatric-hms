import React from "react";
export const Button = ({ 
    children, 
    type = "button", 
    variant = "primary", 
    size = "md", 
    isLoading = false, 
    loadingText = "Loading...",
    onClick, 
    className = ""
  }) => {
    const baseStyles = "font-medium rounded-md flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variantStyles = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600",
      outline: "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-blue-500"
    };
    
    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg"
    };
    
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      >
        {isLoading ? loadingText : children}
      </button>
    );
  };
  