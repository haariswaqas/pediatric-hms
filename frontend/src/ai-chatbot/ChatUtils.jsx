import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', text = 'Loading...', overlay = false, className = '' }) => {
    const sizeClasses = {
      sm: 'h-3 w-3 border-2',
      md: 'h-4 w-4 border-2',
      lg: 'h-6 w-6 border-2',
      xl: 'h-8 w-2 border-2',
    };
  
    const spinner = (
      <span
        role="status"
        aria-live="polite"
        className={`inline-flex items-center ${className}`}
      >
        <span
          className={`inline-block ${sizeClasses[size] || sizeClasses.md} rounded-full animate-spin border-transparent border-t-blue-600`}
          style={{ borderStyle: 'solid' }}
        />
        {text ? (
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-300" aria-hidden="true">
            {text}
          </span>
        ) : (
          <span className="sr-only">Loading</span>
        )}
      </span>
    );
  
    if (overlay) {
      return (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.18)' }}
        >
          <div className="pointer-events-auto p-2 rounded-md bg-white dark:bg-gray-800 shadow-md">
            {spinner}
          </div>
        </div>
      );
    }
  
    return spinner;
  };
  
// Error Alert Component
export const ErrorAlert = ({ message, onDismiss, className = '' }) => {
  return (
    <div className={`flex items-center p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      <div className="ml-3 flex-1">
        <p className="text-sm text-red-700">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-3 text-red-400 hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Success Alert Component
export const SuccessAlert = ({ message, onDismiss, className = '' }) => {
  return (
    <div className={`flex items-center p-3 bg-green-50 border border-green-200 rounded-lg ${className}`}>
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
      <div className="ml-3 flex-1">
        <p className="text-sm text-green-700">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-3 text-green-400 hover:text-green-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Info Alert Component
export const InfoAlert = ({ message, onDismiss, className = '' }) => {
  return (
    <div className={`flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
      <div className="ml-3 flex-1">
        <p className="text-sm text-blue-700">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-3 text-blue-400 hover:text-blue-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Empty State Component
export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  actionText = 'Get Started',
  className = '' 
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      )}
      {action && (
        <button
          onClick={action}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

// Typing Indicator Component
export const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-2 text-gray-500 text-sm">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span>Assistant is typing...</span>
    </div>
  );
};

// Connection Status Component
export const ConnectionStatus = ({ isConnected = true, className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 text-xs ${className}`}>
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-400' : 'bg-red-400'
      }`}></div>
      <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
};

// Message Status Component
export const MessageStatus = ({ status = 'sent', className = '' }) => {
  const statusConfig = {
    sending: { color: 'text-gray-400', text: 'Sending...' },
    sent: { color: 'text-gray-500', text: 'Sent' },
    delivered: { color: 'text-blue-500', text: 'Delivered' },
    error: { color: 'text-red-500', text: 'Failed to send' }
  };

  const config = statusConfig[status] || statusConfig.sent;

  return (
    <span className={`text-xs ${config.color} ${className}`}>
      {config.text}
    </span>
  );
};

export default {
  LoadingSpinner,
  ErrorAlert,
  SuccessAlert,
  InfoAlert,
  EmptyState,
  TypingIndicator,
  ConnectionStatus,
  MessageStatus
};