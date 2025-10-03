import React from 'react';
import { Send, Loader2 } from 'lucide-react';

/**
 * ChatInput
 * - inline dark: styling
 * - small non-blocking loader inside send button
 */
const ChatInput = ({ value, setValue, onSend, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading && value.trim()) {
      onSend();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2">
      <div className="flex-1 relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
          className="w-full px-4 py-3 pr-14 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     border-gray-300 bg-white text-gray-900 placeholder-gray-400
                     dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
          rows={1}
          style={{
            minHeight: '48px',
            maxHeight: '160px',
            overflow: 'auto',
          }}
          disabled={loading}
          aria-label="Chat message input"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className={`absolute right-3 bottom-3 p-2 rounded-full transition-colors
                      ${loading ? 'opacity-80 cursor-wait' : 'hover:bg-blue-50'}
                      text-blue-600 dark:text-blue-400`}
          aria-label={loading ? 'Sending' : 'Send message'}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
