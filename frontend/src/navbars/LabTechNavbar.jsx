import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../store/auth/authSlice';
import ThemeToggle from '../theme/ThemeToggle';
import { TestTube, ChartBar, FileText, Settings, HelpCircle, Search, LogOut, ChevronDown, Menu, X, UserRound } from 'lucide-react';
import NotificationDropdown from '../notifications/NotificationDropDown';

export default function LabTechNavbar({ toggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef();
  const mobileMenuRef = useRef();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = e => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && e.target.id !== 'mobile-menu-button') {
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
    { label: 'Lab Tests', icon: <TestTube className="w-5 h-5" />, href: '/labs/lab-tests' },
    { label: 'Lab Request Items', icon: <TestTube className="w-5 h-5" />, href: '/labs/lab-request-items' },
    { label: 'Lab Results', icon: <TestTube className="w-5 h-5" />, href: '/labs/lab-results' },
    { label: 'Lab Parameters', icon: <TestTube className="w-5 h-5" />, href: '/labs/lab-result-parameters' },
    { label: 'Reports', icon: <ChartBar className="w-5 h-5" />, href: '/reports' },
  ];

  const userMenuItems = [
    { label: 'Profile Settings', icon: <UserRound className="w-4 h-4" />, href: '/profile' },
    { label: 'System Settings', icon: <Settings className="w-4 h-4" />, href: '/settings' },
    { label: 'Help & Support', icon: <HelpCircle className="w-4 h-4" />, href: '/support' },
  ];

  return (
    <header className="sticky top-0 z-40">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between h-16">
            {/* Left side: sidebar toggle + logo */}
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 mr-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:outline-none"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link to="/home" className="flex items-center">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-xl mr-2">HMS</span>
                <span className="hidden sm:block text-lg text-gray-700 dark:text-gray-200">Lab Technician</span>
              </Link>
              <div className="ml-2 flex items-center md:hidden">
                <button
                  id="mobile-menu-button"
                  onClick={() => setMobileMenuOpen(o => !o)}
                  className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}  
                </button>
              </div>
            </div>

            {/* Desktop nav items */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              {mainNavItems.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-800 rounded-md transition"
                >
                  {item.icon}
                  <span className="ml-1">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                className="p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                onClick={() => navigate('/search')}
              >
                <Search className="w-5 h-5" />
              </button>

              <NotificationDropdown />

              <ThemeToggle />

              <div className="relative ml-1" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center space-x-1 px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-800 dark:text-purple-300">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block max-w-[100px] truncate">
                    {user?.username || user?.email}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.name || user?.username || user?.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.role || 'Lab Technician'}
                      </p>
                    </div>
                    <div className="py-1">
                      {userMenuItems.map(item => (
                        <Link
                          key={item.href}
                          to={item.href}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {item.icon}
                          <span className="ml-2">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="ml-2">Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile navigation menu */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-md transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'} absolute w-full z-30`}
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
    </header>
  );
}