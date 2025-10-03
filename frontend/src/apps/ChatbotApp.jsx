import { Routes, Route } from 'react-router-dom';
import RestrictedRoute from '../routes/RestrictedRoute';
import ChatContainer, { MobileChatContainer, EmbeddedChat } from '../ai-chatbot/ChatContainer';
import ChatHistory from '../ai-chatbot/ChatHistory';
import ConversationList from '../ai-chatbot/ConversationList';
import ConversationPDFView from '../ai-chatbot/ConversationPDFView';

export default function ChatbotApp() {
  return (
    <Routes>
      {/* Main Chatbot Interface - Full Featured */}
      <Route
        path="/"
        element={
          <RestrictedRoute allowedRoles={['admin', 'doctor', 'nurse', 'pharmacist', 'parent']}>
            <ChatContainer 
              fullHeight={true}
              showHeader={true}
              allowFullscreen={true}
              className="h-screen"
            />
          </RestrictedRoute>
        }
      />

      {/* Mobile Optimized Chat Interface */}
      <Route
        path="/mobile"
        element={
          <RestrictedRoute allowedRoles={['admin', 'doctor', 'nurse', 'pharmacist', 'parent']}>
            <MobileChatContainer />
          </RestrictedRoute>
        }
      />

      {/* Embedded Chat for Dashboard/Other Pages */}
      <Route
        path="/embed"
        element={
          <RestrictedRoute allowedRoles={['admin', 'doctor', 'nurse', 'pharmacist', 'parent']}>
            <div className="p-4">
              <EmbeddedChat />
            </div>
          </RestrictedRoute>
        }
      />

      {/* Chat History Page */}
      <Route
        path="/history"
        element={
          <RestrictedRoute allowedRoles={['admin', 'doctor', 'nurse', 'pharmacist', 'parent']}>
            <ChatHistory />
          </RestrictedRoute>
        }
      />

      {/* Conversations Management Page */}
      <Route
        path="/conversation-list"
        element={
          <RestrictedRoute allowedRoles={['admin', 'doctor', 'nurse', 'pharmacist', 'parent']}>
            <ConversationList />
          </RestrictedRoute>
        }
      />

      {/* Individual Conversation View */}
      <Route
        path="/conversations/:sessionId"
        element={
          <RestrictedRoute allowedRoles={['admin', 'doctor', 'nurse', 'pharmacist', 'parent']}>
            <ChatContainer 
              fullHeight={true}
              showHeader={true}
              allowFullscreen={true}
              className="h-screen"
            />
          </RestrictedRoute>
        }
      />
      <Route path="/conversations/:conversationId/pdf" element={<ConversationPDFView />} />
    </Routes>
  );
}