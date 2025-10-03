// 1. SectionAccordion.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function SectionAccordion({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
      >
        <span className="font-semibold text-gray-700 dark:text-gray-300">{title}</span>
        {open ? <ChevronUp className="text-gray-700 dark:text-gray-300"/> : <ChevronDown className="text-gray-700 dark:text-gray-300"/>}
      </button>
      {open && <div className="p-4 bg-white dark:bg-gray-800 transition-all">
        {children}
      </div>}
    </div>
  );
}