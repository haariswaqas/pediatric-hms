// src/essentials/components/sidebars/ParentSidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, TestTube } from 'lucide-react';
import { ClipboardList } from 'lucide-react';

// Updated parentItems with proper structure
const parentItems = [
  {
    label: 'AI Health Assistant',
    icon: <MessageCircle className="w-6 h-6" />,
    items: [
      { to: '/chatbot', label: 'Chat with AI', icon: <MessageCircle className="w-5 h-5" /> }
    ]
  },
  {
    label: 'My Children',
    icon: <Users className="w-6 h-6" />,
    items: [
      { to: '/children', label: 'View Children', icon: <Users className="w-5 h-5" /> },
      { to: '/children/add', label: 'Add Child', icon: <UserPlus className="w-5 h-5" /> }
    ]
  },
  {
    label: 'Appointments',
    icon: <Calendar className="w-6 h-6" />,
    items: [
      { to: '/appointments', label: 'View Appointments', icon: <Calendar className="w-5 h-5" /> },
      { to: '/appointments/add', label: 'Book Appointment', icon: <CalendarPlus className="w-5 h-5" /> }
    ]
  },
  {
    label: 'Vaccination Records',
    icon: <Syringe className="w-6 h-6" />,
    items: [
      { to: '/vaccines/vaccination-records', label: 'View Records', icon: <FileText className="w-5 h-5" /> },
      
    ]
  },
  {
    label: 'Labs',
    icon: <TestTube className="w-6 h-6" />,
    items: [
      { to: '/labs/lab-result-parameters', label: 'View Lab Results', icon: <TestTube className="w-5 h-5" /> },
      
    ]
  },

];

// Import the required icons
import { 
  MessageCircle, 
  Users, 
  UserPlus, 
  Calendar, 
  CalendarPlus, 
  Syringe, 
  FileText, 
  Clock, 
  Pill 
} from 'lucide-react';

export default function ParentSidebar({ collapsed }) {
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState(
    parentItems.reduce((acc, group) => ({ ...acc, [group.label]: true }), {})
  );

  const toggleGroup = (label) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <nav className={`flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full p-4 transition-width duration-200 ${collapsed ? 'w-16' : 'w-64'}`}>
      {!collapsed && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Parent Panel</h2>
        </div>
      )}
      
      <ul className="flex-1 space-y-2 overflow-y-auto">
        {parentItems.map(group => (
          <li key={group.label}>
            {/* group header */}
            <button
              type="button"
              onClick={() => toggleGroup(group.label)}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                collapsed
                  ? 'justify-center'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center">
                <div className="w-6 h-6">{group.icon}</div>
                {!collapsed && <span className="ml-3">{group.label}</span>}
              </div>
              {!collapsed &&
                (openGroups[group.label] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                ))}
            </button>
            {/* group items */}
            {openGroups[group.label] && (
              <ul className="mt-1 space-y-1 ml-8">
                {group.items.map(({ to, icon, label }) => {
                  const active = pathname === to; // ✅ exact match
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
          <Link
            to="/profile"
            className="flex items-center p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="ml-3 text-sm">My Profile</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center p-2 mt-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="ml-3 text-sm">Settings</span>
          </Link>
        </div>
      )}
    </nav>
  );
}