import React from 'react';
import { MessageCircle, Trash2, Plus, FileText } from 'lucide-react';

/**
 * ConversationItem
 * - dark: styling added inline
 * - accessible delete button (stops propagation)
 * - friendly date formatting and truncation
 * - added PDF view button
 */
const ConversationItem = ({ conversation, isActive, onClick, onDelete, onViewPDF }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      onDelete(conversation.session_id);
    }
  };

  const handleViewPDF = (e) => {
    e.stopPropagation();
    // Use the numeric conversation ID for PDF viewing
    console.log('PDF button clicked for conversation ID:', conversation.id);
    onViewPDF(conversation.id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' ? onClick() : null)}
      onClick={onClick}
      className={`group cursor-pointer p-3 rounded-lg transition-colors outline-none
        ${isActive
          ? 'bg-blue-100 border-l-4 border-blue-500 dark:bg-blue-900/20 dark:border-blue-400'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
      `}
      aria-pressed={isActive}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <MessageCircle
              className="w-4 h-4 text-gray-400 flex-shrink-0 dark:text-gray-300"
              aria-hidden="true"
            />
            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
              {conversation.title || `Conversation ${String(conversation.session_id || '').slice(-8)}`}
            </h4>
          </div>

          {conversation.last_message && (
            <p className="text-xs text-gray-600 truncate mb-1 dark:text-gray-300/90">
              <span className="font-medium capitalize">
                {conversation.last_message.role}:
              </span>{' '}
              {truncateText(conversation.last_message.content)}
            </p>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(conversation.updated_at)}
          </p>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleViewPDF}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-opacity"
            title="View PDF"
            aria-label={`View PDF for conversation ${conversation.session_id}`}
          >
            <FileText className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 transition-opacity"
            title="Delete conversation"
            aria-label={`Delete conversation ${conversation.session_id}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ConversationList
 * - dark: styles added inline
 * - Removed invasive loading indicator for better UX
 * - New conversation button with accessible label
 * - Added onViewPDF prop
 */
const ConversationList = ({
  conversations,
  activeSessionId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
  onViewPDF,
  loading,
}) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Conversations</h3>
          <button
            onClick={onNewConversation}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 transition-colors"
            title="New conversation"
            aria-label="Start a new conversation"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">New</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {!loading && (!conversations || conversations.length === 0) && (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-300 text-sm">No conversations yet</p>
            <p className="text-gray-400 dark:text-gray-400 text-xs mt-1">Start chatting to create your first conversation</p>
          </div>
        )}

        <div className="space-y-2">
          {Array.isArray(conversations) && conversations.map((conversation) => (
            <ConversationItem
              key={conversation.session_id}
              conversation={conversation}
              isActive={conversation.session_id === activeSessionId}
              onClick={() => onSelectConversation(conversation.session_id)}
              onDelete={onDeleteConversation}
              onViewPDF={onViewPDF}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConversationList;