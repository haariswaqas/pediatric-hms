// src/essentials/components/navbars/PharmacistNavbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/auth/authSlice';
import { fetchProfile } from '../store/profile/profileSlice';
import { fetchNotifications, readNotification } from '../store/notifications/notificationSlice';
import ThemeToggle from '../theme/ThemeToggle';
import {
  Menu,
  X,
  Search,
  Bell,
  UserRound,
  LogOut,
  ChevronDown,
  ClipboardList,
  FileText,
} from 'lucide-react';

export default function PharmacistNavbar({ toggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(s => s.auth);
  const { profile } = useSelector(s => s.profile);
  const { notifications, loading } = useSelector(s => s.notifications);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef();
  const userRef = useRef();

  useEffect(() => {
    if (user?.role === 'pharmacist') {
      dispatch(fetchProfile());
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const onClickOut = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
      if (mobileOpen && e.target.id !== 'mobile-menu-button') setMobileOpen(false);
    };
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, [mobileOpen]);

  const unread = notifications.filter(n => !n.read).length;
  const markAll = () => notifications.filter(n => !n.read).forEach(n => dispatch(readNotification(n.id)));
  const doLogout = () => { dispatch(logout()); navigate('/auth/login'); };

  const mainNav = [
    { to: '/', icon: <ClipboardList className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/prescriptions/items', icon: <FileText className="w-5 h-5" />, label: 'Prescriptions' },
    { to: '/drugs', icon: <ClipboardList className="w-5 h-5" />, label: 'Inventory' },
    { to: '/drugs/drug-dispenses', icon: <FileText className="w-5 h-5" />, label: 'Dispense' },
  ];

  const userMenu = [
    { to: '/profile', icon: <UserRound className="w-4 h-4" />, label: 'Profile Settings' },
    { to: '/support', icon: <UserRound className="w-4 h-4" />, label: 'Help & Support' },
  ];

  return (
    <header className="sticky top-0 z-40">
      <nav className="bg-white dark:bg-gray-900 border-b shadow-md">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between h-16 items-center">

            {/* Sidebar toggle + Logo */}
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 mr-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link to="/" className="text-xl font-bold text-blue-600">
                Pharmacist Portal
              </Link>
              <div className="md:hidden ml-2">
                <button
                  id="mobile-menu-button"
                  onClick={() => setMobileOpen(o => !o)}
                  className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex space-x-4">
              {mainNav.map(item => {
                const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                      active
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-1 text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate('/search')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <Search className="w-5 h-5 text-gray-500 dark:text-gray-300" />
              </button>
              <ThemeToggle />

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen(o => !o)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative">
                  <Bell className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                  {unread > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>
                {notifOpen && <NotificationDropdown markAllRead={markAll} loading={loading} />}
              </div>

              {/* User menu */}
              <div className="relative" ref={userRef}>
                <button onClick={() => setUserOpen(u => !u)} className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <UserRound className="w-5 h-5 text-gray-500 dark:text-gray-300 mr-1" />
                  <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-200">
                    {profile?.first_name || user?.username}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-1 text-gray-700 dark:text-gray-200" />
                </button>
                {userOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border rounded-lg shadow-lg z-50">
                    {userMenu.map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </Link>
                    ))}
                    <button onClick={doLogout} className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <LogOut className="w-4 h-4 mr-2" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-b shadow-md">
            <div className="pt-2 pb-4 space-y-1">
              {mainNav.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
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
