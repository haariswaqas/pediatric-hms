import React from "react";
import { AlertCircle, ChevronDown, Save, X, HelpCircle, Camera } from 'lucide-react';
// 
// d with tooltip helper
export const FieldWithHelper = ({ label, id, helperText, children, required }) => (
    <div className="mb-4">
      <div className="flex items-center mb-1">
        <label htmlFor={id} className="block font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {helperText && (
          <div className="relative ml-1 group">
            <HelpCircle size={16} className="text-gray-400" />
            <div className="absolute left-0 bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded p-2 hidden group-hover:block z-10">
              {helperText}
              <div className="absolute top-full left-0 w-2 h-2 bg-gray-800 transform rotate-45"></div>
            </div>
          </div>
        )}
      </div>
      {children}
    </div>
  );