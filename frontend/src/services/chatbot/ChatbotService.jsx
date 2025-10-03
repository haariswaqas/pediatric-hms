// src/services/chatbot/ChatbotService.jsx
import axios from 'axios';
import CHATBOT_API from './chatbot_api';
import { handleRequestError } from '../handleRequestError';

const ChatbotService = {
  // send a message to the chatbot
  sendMessage: async (message, token, sessionId = null) => {
    if (!token) throw new Error('Authorization token is missing');
    try {
      const payload = { message };
      if (sessionId) payload.session_id = sessionId;

      const res = await axios.post(`${CHATBOT_API}/chat/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        withCredentials: true,
      });

      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // clear a conversation session
  clearSession: async (sessionId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!sessionId) throw new Error('Session ID is required');

    try {
      const res = await axios.delete(`${CHATBOT_API}/chat/${sessionId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // get all active sessions + user conversations
  getActiveSessions: async (token) => {
    if (!token) throw new Error('Authorization token is missing');
    try {
      const res = await axios.get(`${CHATBOT_API}/sessions/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // get all conversations for user
  getConversations: async (token) => {
    if (!token) throw new Error('Authorization token is missing');
    try {
      const res = await axios.get(`${CHATBOT_API}/conversations/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // get details of a conversation
  getConversationDetail: async (sessionId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!sessionId) throw new Error('Session ID is required');

    try {
      const res = await axios.get(`${CHATBOT_API}/conversations/${sessionId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // health check (optional, via Django proxy)
  healthCheck: async (token) => {
    if (!token) throw new Error('Authorization token is missing');
    try {
      const res = await axios.get(`${CHATBOT_API}/health/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },
  fetchConversationPdf: async (conversationId, token) => {
    if (!token) throw new Error("Authorization token is missing");
    if (!conversationId) throw new Error("Conversation ID is required");

    try {
      const res = await axios.get(`${CHATBOT_API}/conversations/${conversationId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // ✅ important for PDF
        withCredentials: true,
      });

      // ✅ Explicitly set Blob type to application/pdf
      const fileUrl = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );

      return fileUrl;
    } catch (err) {
      handleRequestError(err);
    }
  }, 

  downloadConversationPdf: async (conversationId, token) => {
    const fileUrl = await ChatbotService.fetchConversationPdf(conversationId, token);
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", `conversation_${conversationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  },
};

export default ChatbotService;
