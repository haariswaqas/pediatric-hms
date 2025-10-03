// src/chatbot/Chatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  sendMessage,
  clearSession,
  resetConversation,
  getConversations,
  getConversationDetail,
  setActiveSession,
} from "../store/chatbot/chatbotSlice";
import ChatInput from "./ChatInput";
import ChatMessageList from "./ChatMessageList";
import ConversationList from "./ConversationList";
import { Settings, Menu, X, Trash2 } from "lucide-react";

const Chatbot = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const { conversations, conversationId, sessionId, loading, error, allConversations } =
    useSelector((state) => state.chatbot);

  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Helper: normalize different conversation shapes into an array of messages
  const extractMessages = (stored) => {
    if (!stored) return [];
    if (Array.isArray(stored)) return stored;
    if (Array.isArray(stored.messages)) return stored.messages;
    if (Array.isArray(stored.conversation_history)) return stored.conversation_history;
    // fallback: pick first array property
    for (const k of Object.keys(stored)) {
      if (Array.isArray(stored[k])) return stored[k];
    }
    return [];
  };

  // conversation history of active session
  const conversationHistory = sessionId ? extractMessages(conversations[sessionId]) : [];

  // Load conversations when user logs in
  useEffect(() => {
    if (user) {
      dispatch(getConversations());
    }
  }, [dispatch, user]);

  // Scroll to bottom when conversationHistory changes
  // Only scroll if there are new messages (not just switching)
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (conversationHistory.length > prevCountRef.current) {
      // new message added
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevCountRef.current = conversationHistory.length;
  }, [conversationHistory.length]);

  // Send a message (optimistic UX)
  const handleSend = async () => {
    if (!input.trim()) return;

    const messageText = input.trim();
    setInput(""); // optimistic

    try {
      const result = await dispatch(sendMessage({ message: messageText, sessionId })).unwrap();

      // Determine session id returned
      const newSessionId = result?.session_id || result?.sessionId || null;

      if (newSessionId) {
        // Make this session active immediately so UI shows it
        dispatch(setActiveSession(newSessionId));

        // If the store does not yet contain messages (race), request details
        const storedMsgs = extractMessages(conversations[newSessionId] || []);
        if (storedMsgs.length === 0 && result?.conversation_history) {
          // prefer using result data if available: dispatching getConversationDetail ensures canonical shape in store
          dispatch(getConversationDetail(newSessionId));
        }
      }

      // Refresh list to update last message preview
      dispatch(getConversations());
    } catch (err) {
      // restore input to avoid losing text
      console.error("Send message failed:", err);
      setInput(messageText);
    }
  };

  const handleClear = () => {
    if (!user || !sessionId) return;
    if (!window.confirm("Are you sure you want to clear this conversation?")) return;

    dispatch(clearSession(sessionId))
      .unwrap()
      .then(() => {
        dispatch(resetConversation(sessionId));
        dispatch(getConversations());
      })
      .catch((e) => console.error("clearSession error", e));
  };

  const handleViewPdf = () => {
    if (!user || !sessionId) return;
    navigate(`/chatbot/conversations/${sessionId}/pdf`);
  };

  const handleSelectConversation = (id) => {
    // instant highlight / active session
    dispatch(setActiveSession(id));
    // fetch messages (non-blocking)
    dispatch(getConversationDetail(id));
  };

  const handleDeleteConversation = (id) => {
    dispatch(clearSession(id))
      .unwrap()
      .then(() => {
        if (sessionId === id) dispatch(setActiveSession(null));
        dispatch(getConversations());
      })
      .catch((e) => console.error("Delete conversation error", e));
  };

  const handleNewConversation = () => {
    dispatch(setActiveSession(null));
    dispatch(resetConversation(null));
    setInput("");
  };

  // NEW: Handle PDF view
  const handleViewPDF = (sessionId) => {
    console.log('Navigating to PDF for session:', sessionId);
    // Use session_id as conversationId for the PDF route
    navigate(`/chatbot/conversations/${sessionId}/pdf`);
  };

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96 rounded-lg bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Please Sign In
          </h3>
          <p className="text-gray-600 dark:text-gray-400">You need to be signed in to use the chatbot.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[800px] max-h-[900px] w-full max-w-7xl mx-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm dark:shadow-2xl bg-white dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 ${
          sidebarOpen ? 'w-80' : 'w-0'
        }`}
      >
        <ConversationList
          conversations={allConversations}
          activeSessionId={sessionId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onNewConversation={handleNewConversation}
          onViewPDF={handleViewPDF}
          loading={loading}
        />
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-600 dark:bg-gray-800 text-white dark:text-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Close conversations" : "Open conversations"}
              className="p-1.5 rounded-md bg-transparent hover:bg-blue-700 dark:hover:bg-gray-700 cursor-pointer text-white dark:text-gray-100 border-none transition-colors duration-200"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div>
              <h3 className="font-bold text-lg text-white dark:text-gray-100">PediaGPT - Pediatrics Chatbot</h3>
              <p className="text-sm opacity-95 text-blue-100 dark:text-gray-300">
                {sessionId ? `Session: ${String(sessionId).slice(-8)}` : "New Conversation"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {sessionId && (
              <button
                onClick={handleClear}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              
            )}
            <div className="text-right text-sm text-white dark:text-gray-100">
              <div className="font-semibold">{user.username || user.email}</div>
              <div className="text-xs opacity-85 text-blue-100 dark:text-gray-300">Online</div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="relative flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-gray-900"
        >
          {conversationHistory.length === 0 && !sessionId ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Settings size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Welcome to PediaGPT!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Start a new conversation or select one from the sidebar.</p>
               
              </div>
            </div>
          ) : (
            <>
              <ChatMessageList messages={conversationHistory} messagesEndRef={messagesEndRef} />
              {/* minimal non-blocking sending badge */}
              {loading && (
                <div
                  aria-live="polite"
                  className="fixed right-6 bottom-20 bg-black/60 dark:bg-white/10 text-white dark:text-gray-100 px-3 py-2 rounded-lg text-sm shadow-lg dark:shadow-2xl z-50"
                >
                  Sending...
                </div>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <ChatInput value={input} setValue={setInput} onSend={handleSend} loading={loading} />
          {error && (
            <div
              className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-200 text-sm"
              role="alert"
            >
              <strong>Error:</strong> {String(error)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;