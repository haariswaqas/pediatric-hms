// src/essentials/components/sidebars/PharmacistSidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  PackageOpen,
  FileText,
} from 'lucide-react';

// Define your groups and items here (or import from a shared utils file)
const pharmacistGroups = [
  {
    label: 'Main',
    icon: <BarChart />,
    items: [
      { to: '/', icon: <BarChart />, label: 'Dashboard' },
      { to: '/prescriptions/items', icon: <FileText />, label: 'Prescriptions' },
      { to: '/drugs', icon: <ClipboardList />, label: 'Inventory' },
    ],
  },
  {
    label: 'Dispensing',
    icon: <PackageOpen />,
    items: [
      { to: '/drugs/drug-dispenses', icon: <PackageOpen />, label: 'Dispense Drugs' },
      
    ],
  },
];

export default function PharmacistSidebar({ collapsed = false }) {
  const { pathname } = useLocation();
  // All groups open by default
  const [openGroups, setOpenGroups] = useState(
    pharmacistGroups.reduce((acc, group) => ({ ...acc, [group.label]: true }), {})
  );

  const toggleGroup = (label) =>
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <nav
      className={`
        flex flex-col bg-blue-50 dark:bg-gray-900 border-r
        h-full p-4 transition-width duration-200
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      <h2
        className={`
          flex items-center text-2xl font-bold mb-6
          ${collapsed ? 'justify-center' : 'text-blue-600'}
        `}
      >
        {!collapsed && 'Pharmacist Panel'}
      </h2>

      <ul className="flex-1 space-y-2 overflow-y-auto">
        {pharmacistGroups.map(group => (
          <li key={group.label}>
            <button
              type="button"
              onClick={() => toggleGroup(group.label)}
              className={`
                w-full flex items-center justify-between p-2 rounded-lg
                transition-colors
                ${collapsed
                  ? 'justify-center'
                  : 'text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800'
                }
              `}
            >
              <div className="flex items-center">
                <div className="w-6 h-6 text-blue-600 dark:text-blue-400">
                  {group.icon}
                </div>
                {!collapsed && <span className="ml-3">{group.label}</span>}
              </div>
              {!collapsed && (
                openGroups[group.label]
                  ? <ChevronDown className="w-4 h-4" />
                  : <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {openGroups[group.label] && (
              <ul className={`mt-1 space-y-1 ${collapsed ? 'hidden' : 'ml-6'}`}>
                {group.items.map(({ to, icon, label }) => {
                  const active = pathname.startsWith(to);
                  return (
                    <li key={to}>
                      <Link
                        to={to}
                        className={`
                          flex items-center p-2 rounded-lg transition-colors
                          ${active
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 dark:text-gray-300'
                          }
                        `}
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
          <Link
            to="/profile"
            className="flex items-center p-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="ml-3 text-sm">My Profile</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center p-2 mt-1 text-gray-600 hover:text-gray-800 transition"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="ml-3 text-sm">Settings</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
