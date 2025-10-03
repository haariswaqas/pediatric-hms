// src/apps/DoctorNavbar.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../store/auth/authSlice';
import { fetchProfile } from '../store/profile/profileSlice';
import NotificationDropdown from '../notifications/NotificationDropDown';
import ThemeToggle from '../theme/ThemeToggle';
import {
  UserRound,
  ClipboardList,
  Calendar,
  Activity,
  FileText,
  Computer,
  Settings,
  HelpCircle,
  Search,
  Timer,
  LogOut,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export default function DoctorNavbar({ toggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { profile } = useSelector(s => s.profile);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef();
  const mobileMenuRef = useRef();

  // Fetch profile once role is known
  useEffect(() => {
    if (user?.role) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user?.role]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = e => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        e.target.id !== 'mobile-menu-button'
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  const mainNavItems = [
    { label: 'Patients',    icon: <UserRound className="w-5 h-5" />, href: '/children' },
    { label: 'Appointments',icon: <Calendar className="w-5 h-5" />, href: '/appointments' },
    { label: 'Vaccinations',icon: <ClipboardList className="w-5 h-5" />, href: '/vaccines/vaccination-records' },
    { label: 'Shifts',      icon: <Timer className="w-5 h-5" />, href: '/shifts/assignments' },
    { label: 'Clinical Records', icon: <FileText className="w-5 h-5" />, href: '/records' },
    { label: 'Analytics',   icon: <Activity className="w-5 h-5" />, href: '/analytics/patients' },
    { label: 'Reports',     icon: <Computer className="w-5 h-5" />, href: '/reports/patients' },
  ];

  const userMenuItems = [
    { label: 'Profile Settings', icon: <Settings className="w-4 h-4" />, href: '/profile' },
    { label: 'Help & Support',   icon: <HelpCircle className="w-4 h-4" />, href: '/support' },
  ];

  return (
    <header className="sticky top-0 z-40">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between h-16">
            {/* Left: sidebar toggle + logo */}
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 mr-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link to="/home" className="flex items-center">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl mr-2">HMS</span>
                <span className="hidden sm:block text-lg text-gray-700 dark:text-gray-200 font-semibold">
                  Doctor&#39;s Portal
                </span>
              </Link>
              {/* Mobile menu button */}
              <div className="ml-2 md:hidden">
                <button
                  id="mobile-menu-button"
                  onClick={() => setMobileMenuOpen(m => !m)}
                  className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              {mainNavItems.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-md"
                >
                  {item.icon}
                  <span className="ml-1">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Search */}
              <button
                onClick={() => navigate('/search')}
                className="p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme toggle */}
              <ThemeToggle className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" />

              {/* Notifications */}
              <NotificationDropdown />

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(u => !u)}
                  className="flex items-center p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <UserRound className="w-5 h-5 mr-1" />
                  <span className="hidden sm:inline">
                    {profile?.first_name && profile?.last_name
                      ? `Dr. ${profile.first_name} ${profile.last_name}`
                      : user?.username}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    {userMenuItems.map(item => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile nav links */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-md"
          >
            <div className="pt-2 pb-4 space-y-1">
              {mainNavItems.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
