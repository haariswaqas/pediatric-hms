import React from 'react';
import ChatMessage from './ChatMessage';
import { Bot } from 'lucide-react';

/**
 * ChatMessageList
 * - Normalizes various message payload shapes:
 *   - array of messages
 *   - { messages: [...] }
 *   - { conversation_history: [...] }
 * - Avoids crash when messages is not an array.
 * - Shows typing indicator when loading
 */
const ChatMessageList = ({ messages, messagesEndRef, loading = false }) => {
  // Normalize to an array of message objects
  let msgs = [];

  if (!messages) {
    msgs = [];
  } else if (Array.isArray(messages)) {
    msgs = messages;
  } else if (typeof messages === 'object') {
    // try common shapes
    if (Array.isArray(messages.messages)) {
      msgs = messages.messages;
    } else if (Array.isArray(messages.conversation_history)) {
      msgs = messages.conversation_history;
    } else if (Array.isArray(messages.history)) {
      msgs = messages.history;
    } else {
      // If it's a map of session => { messages: [...] } (defensive)
      // try to find first array inside
      const found = Object.values(messages).find((v) => Array.isArray(v));
      msgs = found ?? [];
    }
  } else {
    // fallback (e.g., string) -> empty
    msgs = [];
  }

  if (msgs.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-medium mb-2">Welcome to Medical Chatbot</p>
          <p className="text-sm">Start a conversation by typing a message below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {msgs.map((message, index) => (
        <ChatMessage key={message.id ?? message.created_at ?? index} message={message} />
      ))}
      
      {/* Show typing indicator when loading and there are existing messages */}
      {loading && msgs.length > 0 && (
        <ChatMessage isTyping={true} />
      )}
      
      {/* Show typing indicator when loading and no messages (first message) */}
      {loading && msgs.length === 0 && (
        <div className="space-y-4">
          <ChatMessage isTyping={true} />
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;