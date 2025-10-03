import React from "react";

export const FormSection = ({ title, description, children }) => (
    <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-200">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

   export const steps = [
      "Personal Information", 
      "Medical History", 
      "Education & Emergency", 
      "Detailed Medical"
    ];