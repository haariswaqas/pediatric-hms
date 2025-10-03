import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Chatbot from './Chatbot';
import { ErrorAlert, LoadingSpinner } from './ChatUtils';
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react';

const ChatContainer = ({
  fullHeight = true,
  className = '',
  showHeader = true,
  allowFullscreen = true,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const { user, loading: authLoading } = useSelector((state) => state.auth || {});
  const { error, loading } = useSelector((state) => state.chatbot);

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Handle escape key for fullscreen
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  // Handle retry logic
  const handleRetry = () => {
    setIsRetrying(true);
    // placeholder - trigger actual retry logic as needed
    setTimeout(() => setIsRetrying(false), 1000);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // container classes: include dark mode classes inline (dark:)
  const containerClasses = `
    relative
    ${isFullscreen ? 'fixed inset-0 z-50' : ''}
    ${isFullscreen ? 'bg-white dark:bg-gray-900' : (fullHeight ? 'min-h-screen' : 'min-h-[1000px]')}
    ${className}
    transition-all duration-300
  `;

  if (authLoading) {
    return (
      <div className={`${containerClasses} flex items-center justify-center bg-gray-50 dark:bg-gray-800`}>
        <div className="text-center">
          <LoadingSpinner size="lg" text="Initializing..." />
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses} aria-live="polite">
      {/* Header */}
      {showHeader && (
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-9 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Medical Assistant
              </h2>
              {user && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {user.username || user.email}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {error && (
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/40"
                  title="Retry last action"
                >
                  <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>Retry</span>
                </button>
              )}

           
            </div>
          </div>

          {/* Global Error Alert */}
          {error && (
            <div className="mt-2">
              <ErrorAlert
                message={error}
                onDismiss={() => {
                  // optional: dispatch an action to clear error in store
                  console.log('Clear error');
                }}
                className="dark:bg-red-900/30"
              />
            </div>
          )}
        </div>
      )}

      {/* Main Chat Interface */}
      <div className={`${showHeader ? 'flex-1' : 'h-full'} overflow-hidden bg-white dark:bg-gray-900 relative z-10`}>
        <Chatbot />
      </div>

      {/* Minimal non-blocking Loading Badge (bottom-right) */}
      {loading && (
        <div className="fixed right-4 bottom-6 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg shadow-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <LoadingSpinner size="sm" text={null} />
              <span className="text-sm text-gray-700 dark:text-gray-200">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mobile-optimized wrapper
export const MobileChatContainer = (props) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <ChatContainer
        {...props}
        fullHeight={true}
        className="max-w-full"
        showHeader={true}
        allowFullscreen={false}
      />
    </div>
  );
};

// Embedded version for other pages
export const EmbeddedChat = (props) => {
  return (
    <ChatContainer
      {...props}
      fullHeight={false}
      className="max-w-4xl mx-auto"
      showHeader={false}
      allowFullscreen={true}
    />
  );
};

export default ChatContainer;