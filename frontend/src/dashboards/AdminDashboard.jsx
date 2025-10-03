// src/dashboards/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/auth/authSlice';
import { fetchNotifications } from '../store/notifications/notificationSlice';
import {ActionButton} from './components/ActionButton';
import NotificationList from '../notifications/NotificationList';
import {Users, FileText, Clock, BarChart2, Settings, ShieldCheck, Bell, LogOut, CalendarRange, Bed, UserRoundMinus, Timer, Activity, BedDoubleIcon, ChartBar, Search, TestTubeDiagonalIcon} from 'lucide-react';
import {ADMIN_CATEGORIES as CATEGORY } from './components/ActionCategories';


export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notifications);

  // Local UI state
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');


  // Grab unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications once
  useEffect(() => {
    dispatch(fetchNotifications());
    // Set up a periodic refresh
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [dispatch]);

  // Define all actions
  const allActions = useMemo(() => [
    {
      label: 'Manage Users',
      icon: <Users />,
      onClick: () => navigate('/users/view-all'),
      category: CATEGORY.USERS
    },
    {
      label: 'Manage Role Permissions',
      icon: <Users />,
      onClick: () => navigate('/role-management'),
      category: CATEGORY.USERS
    },

    {
      label: 'User Analytics',
      icon: <Activity />,
      onClick: () => navigate('/users/user-analytics'),
      category: CATEGORY.ANALYTICS
    },
    {
      label: 'Manage Patients',
      icon: <UserRoundMinus />,
      onClick: () => navigate('/children'),
      category: CATEGORY.MEDICAL
    },
    {
      label: 'Manage Appointments',
      icon: <CalendarRange />,
      onClick: () => navigate('/appointments'),
      category: CATEGORY.MEDICAL
    },
    {
      label: 'Manage Vaccinations',
      icon: <TestTubeDiagonalIcon />,
      onClick: () => navigate('/vaccines'),
      category: CATEGORY.MEDICAL
    },
    {
      label: 'Manage Admission Records',
      icon: <Bed />,
      onClick: () => navigate('/admissions'),
      category: CATEGORY.MEDICAL
    },
    {
      label: 'Manage Shifts',
      icon: <Timer />,
      onClick: () => navigate('/shifts'),
      category: CATEGORY.MEDICAL
    },
    {
      label: 'Manage Wards',
      icon: <BedDoubleIcon />,
      onClick: () => navigate('/wards'),
      category: CATEGORY.MEDICAL
    },
    {
      label: 'Manage Beds',
      icon: <BedDoubleIcon />,
      onClick: () => navigate('/wards/beds'),
      category: CATEGORY.MEDICAL
    },
    {
      label: 'System Logs',
      icon: <FileText />,
      onClick: () => navigate('/logging/system-logs'),
      category: CATEGORY.SYSTEM
    },
    {
      label: 'System Analytics',
      icon: <ChartBar />,
      onClick: () => navigate('/logging/log-analytics'),
      category: CATEGORY.ANALYTICS
    },
    {
      label: 'View Reports',
      icon: <BarChart2 />,
      onClick: () => navigate('/reports'),
      category: CATEGORY.ANALYTICS
    },

    {
      label: 'Schedule Tasks',
      icon: <Clock />,
      onClick: () => navigate('/schedules'),
      category: CATEGORY.ANALYTICS
    },


    {
      label: 'Notifications',
      icon: <Bell />,
      onClick: () => setShowNotifications((v) => !v),
      badge: unreadCount,
      category: CATEGORY.SYSTEM
    },
    {
      label: 'Log out',
      icon: <LogOut />,
      onClick: () => dispatch(logout()),
      isDanger: true,
      category: CATEGORY.SYSTEM
    },
  ], [navigate, dispatch, unreadCount]);

  // Filter and sort actions based on search and category
  const filteredActions = useMemo(() => {
    return allActions.filter(action => {
      const matchesSearch = searchQuery.trim() === '' || 
        action.label.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === '' || action.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allActions, searchQuery, activeCategory]);

  // Get unique categories for filter buttons
  const categories = useMemo(() => {
    return [...new Set(allActions.map(action => action.category))].sort();
  }, [allActions]);

  return (
    <div className="px-6 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100">
      <header className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        
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
          Use the quick actions below to manage the system.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory('')}
          className={`px-3 py-1 rounded-full text-sm ${
            activeCategory === '' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1 rounded-full text-sm ${
              activeCategory === category 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredActions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredActions.map((action) => (
            <ActionButton
              key={action.label}
              {...action}
              isActive={action.label === 'Notifications' && showNotifications}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No actions found matching your search</p>
        </div>
      )}

      {/* Notification Panel */}
      {showNotifications && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-3xl mx-auto animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close notifications"
            >
              &times;
            </button>
          </div>
          <NotificationList />
        </div>
      )}
    </div>
  );
}