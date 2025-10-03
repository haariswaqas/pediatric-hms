import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, readNotification } from '../store/notifications/notificationSlice';
import {
  Bell,
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  MessageSquare,
  Computer,
  Heart,
  Zap
} from 'lucide-react';

export default function NotificationDropdown() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, loading } = useSelector(state => state.notifications);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    dispatch(fetchNotifications());
    const interval = setInterval(() => dispatch(fetchNotifications()), 300000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const handleClick = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => notifications.filter(n => !n.read).forEach(n => dispatch(readNotification(n.id)));

  const getIcon = type => {
    switch(type) {
      case 'urgent': return <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0" />;
      case 'success': return <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />;
      case 'pending': return <Clock className="w-6 h-6 text-amber-500 dark:text-amber-400 flex-shrink-0" />;
      case 'info': return <Info className="w-6 h-6 text-blue-500 dark:text-blue-400 flex-shrink-0" />;
      case 'message': return <MessageSquare className="w-6 h-6 text-purple-500 dark:text-purple-400 flex-shrink-0" />;
      case 'system': return <Computer className="w-6 h-6 text-gray-500 dark:text-gray-400 flex-shrink-0" />;
      case 'like': return <Heart className="w-6 h-6 text-pink-500 dark:text-pink-400 flex-shrink-0" />;
      case 'update': return <Zap className="w-6 h-6 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />;
      default: return <Bell className="w-6 h-6 text-blue-500 dark:text-blue-400 flex-shrink-0" />;
    }
  };

  const getTimeAgo = ts => {
    if (!ts) return 'Just now';
    const now = new Date();
    const diff = now - new Date(ts);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl relative transition-all duration-200 hover:scale-105"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 dark:bg-red-600 rounded-full shadow-lg animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-96 max-h-[32rem] overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 backdrop-blur-sm">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead} 
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="overflow-y-auto max-h-[26rem] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {loading ? (
              <div className="flex flex-col justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((n, index) => (
                <div
                  key={n.id}
                  onClick={() => dispatch(readNotification(n.id))}
                  className={`px-6 py-4 border-b last:border-b-0 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                    n.read 
                      ? 'bg-gray-50/50 dark:bg-gray-800/30' 
                      : 'bg-white dark:bg-gray-900 border-l-4 border-l-blue-500 dark:border-l-blue-400'
                  } ${index === notifications.length - 1 ? 'border-b-0' : 'border-b-gray-100 dark:border-b-gray-800'}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold leading-relaxed ${
                            n.read 
                              ? 'text-gray-700 dark:text-gray-300' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {n.title || 'Notification'}
                          </p>
                          <p className={`text-sm leading-relaxed mt-1 ${
                            n.read 
                              ? 'text-gray-500 dark:text-gray-400' 
                              : 'text-gray-600 dark:text-gray-300'
                          }`}>
                            {n.message}
                          </p>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0 mt-2 ml-3"></div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                          {getTimeAgo(n.timestamp)}
                        </p>
                        {n.category && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                            {n.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <button 
                className="w-full text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                onClick={() => {
                  setOpen(false);
                  navigate('/notifications');
                }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}