import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {ClipboardList} from 'lucide-react';
import { nurseItems as nurseGroups } from './utils/groupedButtons';


export default function NurseSidebar({ collapsed }) {
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState(
    nurseGroups.reduce((acc, group) => ({ ...acc, [group.label]: true }), {})
  );

  const toggleGroup = (label) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <nav className={`flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full p-4 transition-width duration-200 ${collapsed ? 'w-16' : 'w-64'}`}>
      <ul className="flex-1 space-y-2 overflow-y-auto">
        {nurseGroups.map(group => (
          <li key={group.label}>
            {/* group header */}
            <button
              type="button"
              onClick={() => toggleGroup(group.label)}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${collapsed ? 'justify-center' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <div className="flex items-center">
                <div className="w-6 h-6">{group.icon}</div>
                {!collapsed && <span className="ml-3">{group.label}</span>}
              </div>
              {!collapsed && (
                openGroups[group.label] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {/* group items */}
            {openGroups[group.label] && (
              <ul className="mt-1 space-y-1 ml-8">
             {group.items.map(({ to, icon, label }) => {
  const active = pathname === to; // exact match only
  return (
    <li key={to}>
      <Link
        to={to}
        className={`flex items-center p-2 rounded-lg transition-colors ${
          active
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <div className="w-5 h-5">{icon}</div>
        {!collapsed && <span className="ml-3 truncate">{label}</span>}
      </Link>
    </li>
  );
})}

              </ul>
            )}
          </li>
        ))}
      </ul>
      {!collapsed && (
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link to="/profile" className="flex items-center p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition">
            <ClipboardList className="w-5 h-5" />
            <span className="ml-3 text-sm">My Profile</span>
          </Link>
          <Link to="/settings" className="flex items-center p-2 mt-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition">
            <ClipboardList className="w-5 h-5" />
            <span className="ml-3 text-sm">Settings</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
