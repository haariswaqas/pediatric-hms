// Component for a toggle switch
import React from "react";
export const Switch = ({ checked, onChange, name }) => (
    <div className="relative inline-block w-12 h-6">
      <input
        type="checkbox"
        className="opacity-0 w-0 h-0"
        checked={checked}
        onChange={onChange}
        name={name}
        id={name}
      />
      <label
        htmlFor={name}
        className={`block absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-300 ${
          checked ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span 
          className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
            checked ? 'transform translate-x-6' : ''
          }`} 
        />
      </label>
    </div>
  );
  