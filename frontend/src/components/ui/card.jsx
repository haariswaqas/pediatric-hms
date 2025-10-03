import React from "react";

export const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={`rounded-lg border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => {
  return (
    <div
      className={`p-6 pb-2 flex flex-col space-y-1.5 ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3
      className={`text-lg font-semibold leading-none tracking-tight dark:text-white ${className || ""}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ className, children, ...props }) => {
  return (
    <p
      className={`text-sm text-gray-500 dark:text-gray-400 ${className || ""}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent = ({ className, children, ...props }) => {
  return (
    <div className={`p-6 pt-4 ${className || ""}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ className, children, ...props }) => {
  return (
    <div
      className={`flex items-center p-6 pt-0 ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
};