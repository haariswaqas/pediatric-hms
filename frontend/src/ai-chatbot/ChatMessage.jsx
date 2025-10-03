import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Typing indicator */
const TypingIndicator = () => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
      <Bot className="w-4 h-4" />
    </div>
    <div className="flex-1 max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg text-left">
      <div className="inline-block px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 rounded-bl-none">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">Typing</span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
      <div className="text-xs mt-1 text-left text-gray-500 dark:text-gray-400">
        <span className="font-medium">Assistant</span>
      </div>
    </div>
  </div>
);

/** Chat message */
const ChatMessage = ({ message, isTyping = false }) => {
  if (isTyping) return <TypingIndicator />;

  // Debug: Log the message structure to console
  console.log('ChatMessage received message:', message);

  const role = message.role ?? message.sender ?? message.author ?? 'assistant';
  
  // Enhanced content extraction with more fallbacks and better handling
  let content = '';
  
  // Try multiple content fields
  if (message.formatted_content) {
    content = message.formatted_content;
  } else if (message.content) {
    content = message.content;
  } else if (message.text) {
    content = message.text;
  } else if (message.message) {
    content = message.message;
  } else if (message.body) {
    content = message.body;
  } else if (message.response) {
    content = message.response;
  } else if (typeof message === 'string') {
    content = message;
  }

  // Ensure content is a string
  if (typeof content !== 'string') {
    content = content ? String(content) : '';
  }

  // Trim whitespace
  content = content.trim();

  // Debug: Log extracted content
  console.log('Extracted content:', content, 'Length:', content.length);

  const ts = message.timestamp ?? message.created_at ?? message.createdAt ?? message.time ?? null;

  const isUser = role === 'user' || role === 'human' || role === 'you';
  const avatarBg = isUser
    ? 'bg-blue-600 text-white'
    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200';
  const bubbleBase = isUser
    ? 'bg-blue-600 text-white rounded-br-none'
    : 'bg-white border border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 rounded-bl-none';

  // If no content, show debug info
  if (!content) {
    return (
      <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${avatarBg}`} aria-hidden="true">
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
        <div className="flex flex-col max-w-xs sm:max-w-sm lg:max-md xl:max-w-lg">
          <div className={`inline-block px-4 py-2 rounded-lg break-words bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700`}>
            <div className="text-sm text-red-700 dark:text-red-300">
              <strong>Debug: Empty content</strong>
              <br />
              <small>Message keys: {Object.keys(message).join(', ')}</small>
              <br />
              <small>Role: {role}</small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${avatarBg}`} aria-hidden="true">
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className="flex flex-col max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg">
        <div className={`inline-block px-4 py-2 rounded-lg break-words ${bubbleBase}`}>
          <div className="text-sm break-words">
            {content.includes('\n') || content.includes('*') || content.includes('#') ? (
              // Use ReactMarkdown for formatted content
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                  li: ({ node, ...props }) => <li className="ml-4 list-disc mb-1" {...props} />,
                  ul: ({ node, ...props }) => <ul className="mb-2 last:mb-0" {...props} />,
                  ol: ({ node, ...props }) => <ol className="mb-2 last:mb-0 list-decimal ml-4" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                  em: ({ node, ...props }) => <em className="italic" {...props} />,
                  code: ({ node, inline, ...props }) => 
                    inline ? (
                      <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs" {...props} />
                    ) : (
                      <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 mb-2 overflow-x-auto">
                        <code {...props} />
                      </pre>
                    ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic mb-2" {...props} />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            ) : (
              // Plain text for simple messages
              <span>{content}</span>
            )}
          </div>
        </div>

        <div className={`text-xs mt-1 ${isUser ? 'text-right text-gray-200' : 'text-left text-gray-500'} dark:text-gray-400`}>
          <span className="font-medium">{isUser ? 'You' : 'Assistant'}</span>
          {ts && (
            <span className="ml-2">
              {new Date(ts).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
export { TypingIndicator };