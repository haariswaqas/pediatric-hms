import React, { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, readNotification } from '../store/notifications/notificationSlice';
import { useSnackbar } from 'notistack';
import { formatDistanceToNow } from 'date-fns';
import PropTypes from 'prop-types';

// Separate notification item component for better organization
const NotificationItem = ({ notification, onNotificationClick }) => {
  const timestamp = notification.timestamp ? (
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
    </p>
  ) : null;

  return (
    <li
      className={`p-4 rounded-lg shadow transition
        ${notification.read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}
        hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500`}
    >
      <button
        onClick={() => onNotificationClick(notification)}
        className="w-full text-left focus:outline-none"
        aria-label={`${notification.read ? 'Read' : 'Unread'} notification: ${notification.title || 'Notification'}`}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold">{notification.title || 'Notification'}</p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {notification.message}
            </p>
            {timestamp}
          </div>
          {!notification.read && (
            <span className="ml-4 text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center">
              <span className="h-2 w-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-1"></span>
              New
            </span>
          )}
        </div>
      </button>
    </li>
  );
};

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    read: PropTypes.bool.isRequired,
    timestamp: PropTypes.string
  }).isRequired,
  onNotificationClick: PropTypes.func.isRequired
};

const NotificationList = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { notifications, loading, error } = useSelector((state) => state.notifications);

  useEffect(() => {
    // Set up a refresh interval and clean it up on unmount
    dispatch(fetchNotifications());
    const refreshInterval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 20000); // Refresh every minute

    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  const handleNotificationClick = useCallback((notification) => {
    if (!notification.read) {
      dispatch(readNotification(notification.id))
        .unwrap()
        .then(() => {
          enqueueSnackbar(`Marked "${notification.title || 'Notification'}" as read`, {
            variant: 'info',
            autoHideDuration: 3000,
          });
        })
        .catch((err) => {
          enqueueSnackbar(`Failed to mark notification as read: ${err.message}`, {
            variant: 'error',
          });
        });
    }
  }, [dispatch, enqueueSnackbar]);

  const sortedNotifications = useMemo(() => {
    // Show unread notifications first, then sort by timestamp (newest first)
    return [...notifications].sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });
  }, [notifications]);

  if (loading && notifications.length === 0) {
    return (
      <div className={`flex justify-center items-center p-6 ${className}`}>
        <div className="animate-pulse flex space-x-2">
          <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
          <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
          <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 text-red-600 dark:text-red-400 ${className}`}>
        <p className="font-medium">Failed to load notifications</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={() => dispatch(fetchNotifications())}
          className="mt-2 px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (sortedNotifications.length === 0) {
    return (
      <div className={`p-6 text-center text-gray-500 dark:text-gray-400 ${className}`}>
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <ul className={`space-y-2 ${className}`} aria-label="Notifications">
      {sortedNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onNotificationClick={handleNotificationClick}
        />
      ))}
      {loading && (
        <li className="text-center p-2 text-sm text-gray-500 dark:text-gray-400">
          Refreshing...
        </li>
      )}
    </ul>
  );
};

NotificationList.propTypes = {
  className: PropTypes.string
};

export default NotificationList;