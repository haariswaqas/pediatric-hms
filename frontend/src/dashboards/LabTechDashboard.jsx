import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/auth/authSlice';
import {
  Beaker,
  PlusCircle,
  ClipboardList,
  CheckCircle,
  Database,
  BarChart,
  LogOut,
  Search,
} from 'lucide-react';
import { ActionButton } from './components/ActionButton';

// flatten labTechItems into a list of buttons
const labTechItems = [
  {
    label: 'Lab Tests',
    icon: <Beaker />,
    items: [
      { to: '/labs', label: 'Lab Tests', icon: <Beaker /> },
      { to: '/labs/add', label: 'Add Lab Test', icon: <PlusCircle /> },
    ],
  },
  {
    label: 'Lab Request Items',
    icon: <ClipboardList />,
    items: [
      { to: '/labs/lab-request-items', label: 'Lab Request Items', icon: <ClipboardList /> },
    ],
  },
  {
    label: 'Lab Results',
    icon: <CheckCircle />,
    items: [
      { to: '/labs/lab-results', label: 'Lab Results', icon: <CheckCircle /> },
      { to: '/labs/add-lab-result', label: 'Add Lab Result', icon: <PlusCircle /> },
    ],
  },
  {
    label: 'Lab Result Parameters',
    icon: <Database />,
    items: [
      { to: '/labs/lab-result-parameters', label: 'Lab Result Parameters', icon: <Database /> },
      { to: '/labs/add-lab-result-parameter', label: 'Add Lab Result Parameter', icon: <PlusCircle /> },
    ],
  },
  {
    label: 'Reports',
    icon: <BarChart />,
    items: [
      { to: '/reports', label: 'Patient Reports', icon: <BarChart /> },
    ],
  },
];

export default function LabTechDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');

  // flatten all sub-items + add logout
  const allActions = useMemo(() => {
    const actions = labTechItems.flatMap(group =>
      group.items.map(item => ({
        label: item.label,
        icon: item.icon,
        onClick: () => navigate(item.to),
      }))
    );

    // add logout
    actions.push({
      label: 'Log out',
      icon: <LogOut />,
      onClick: () => dispatch(logout()),
      isDanger: true,
    });

    return actions;
  }, [navigate, dispatch]);

  const filteredActions = useMemo(() => {
    return allActions.filter(action =>
      searchQuery.trim() === '' ||
      action.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allActions, searchQuery]);

  return (
    <div className="px-6 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100">
      <header className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold">Lab Technician Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">👋</span>
          <p>
            Welcome, <span className="font-medium">{user?.username || user?.email}</span>!
          </p>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Use the quick actions below to manage lab operations.
        </p>
      </div>

      {filteredActions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActions.map(action => (
            <ActionButton key={action.label} {...action} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No actions found matching your search</p>
        </div>
      )}
    </div>
  );
}
