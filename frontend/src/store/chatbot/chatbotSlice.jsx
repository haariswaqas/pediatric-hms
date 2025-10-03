import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ChatbotService from '../../services/chatbot/ChatbotService';

/**
 * Async thunks
 */

// Send a message
export const sendMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async ({ message, sessionId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      if (!token) throw new Error('User not authenticated');

      const data = await ChatbotService.sendMessage(message, token, sessionId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Clear a session
export const clearSession = createAsyncThunk(
  'chatbot/clearSession',
  async (sessionId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      if (!token) throw new Error('User not authenticated');

      const data = await ChatbotService.clearSession(sessionId, token);
      return { sessionId, ...data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get active sessions
export const getActiveSessions = createAsyncThunk(
  'chatbot/getActiveSessions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      if (!token) throw new Error('User not authenticated');

      const sessions = await ChatbotService.getActiveSessions(token);
      return sessions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get all conversations
export const getConversations = createAsyncThunk(
  'chatbot/getConversations',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      if (!token) throw new Error('User not authenticated');

      const conversations = await ChatbotService.getConversations(token);
      return conversations;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get conversation detail
export const getConversationDetail = createAsyncThunk(
  'chatbot/getConversationDetail',
  async (sessionId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      if (!token) throw new Error('User not authenticated');

      const conversation = await ChatbotService.getConversationDetail(sessionId, token);
      return { sessionId, conversation };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Health check
export const healthCheck = createAsyncThunk(
  'chatbot/healthCheck',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      if (!token) throw new Error('User not authenticated');

      const data = await ChatbotService.healthCheck(token);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchConversationPdf = createAsyncThunk(
  "chatbot/fetchConversationPdf",
  async(conversationId, {getState, rejectWithValue}) => {
    try {
      const token = getState().auth.access;
      if (!token) throw new Error('User not authenticated');

      const fileUrl = await ChatbotService.fetchConversationPdf(conversationId, token);
      return { conversationId, fileUrl };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
)

export const downloadConversationPdf = createAsyncThunk(
  "chatbot/downloadConversationPdf", 
  async (conversationId, {getState, rejectWithValue}) => {
    try {
      const token = getState().auth.access;
      if (!token) throw new Error('User not authenticated');

      await ChatbotService.downloadConversationPdf(conversationId, token);
      return conversationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
)

/**
 * Initial state
 */
const initialState = {
  conversations: {}, // { sessionId: [messages] }
  allConversations: [], // list of all conversations
  conversationPdfs: {}, // store blob URLs keyed by conversationId
  sessionId: null, // currently active session
  activeSessions: [],
  loading: false,
  error: null,
  health: null,
};

/**
 * Slice
 */
const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    resetConversation: (state, action) => {
      const sessionId = action.payload;
      if (sessionId && state.conversations[sessionId]) {
        state.conversations[sessionId] = [];
      }
      state.sessionId = null;
      state.error = null;
    },
    setActiveSession: (state, action) => {
      state.sessionId = action.payload;
    },
    clearConversationPdf: (state, action) => {
      delete state.conversationPdfs[action.payload];
    },
  },
  extraReducers: (builder) => {
    // sendMessage
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const { response, session_id, conversation_history } = action.payload;
        state.sessionId = session_id;

        if (!state.conversations[session_id]) state.conversations[session_id] = [];
        state.conversations[session_id] = conversation_history;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // clearSession
    builder
      .addCase(clearSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearSession.fulfilled, (state, action) => {
        state.loading = false;
        const { sessionId } = action.payload;
        if (state.sessionId === sessionId) {
          state.sessionId = null;
        }
        delete state.conversations[sessionId];
      })
      .addCase(clearSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // getActiveSessions
    builder
      .addCase(getActiveSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSessions = action.payload;
      })
      .addCase(getActiveSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // getConversations
    builder
      .addCase(getConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.allConversations = action.payload;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // getConversationDetail
    builder
      .addCase(getConversationDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversationDetail.fulfilled, (state, action) => {
        state.loading = false;
        const { sessionId, conversation } = action.payload;
        state.sessionId = sessionId; // mark as active
        state.conversations[sessionId] = conversation;
      })
      .addCase(getConversationDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // healthCheck
    builder
      .addCase(healthCheck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(healthCheck.fulfilled, (state, action) => {
        state.loading = false;
        state.health = action.payload;
      })
      .addCase(healthCheck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchConversationPdf
            .addCase(fetchConversationPdf.pending, (state) => {
              state.loading = true;
              state.error = null;
            })
            .addCase(fetchConversationPdf.fulfilled, (state, action) => {
              state.loading = false;
              state.conversationPdfs[action.payload.conversationId] = action.payload.fileUrl;
            })
            .addCase(fetchConversationPdf.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
            })

             // downloadConversationPdf
                  .addCase(downloadConversationPdf.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                  })
                  .addCase(downloadConversationPdf.fulfilled, (state) => {
                    state.loading = false;
                  })
                  .addCase(downloadConversationPdf.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                  });
  },
});

export const { resetConversation, setActiveSession, clearConversationPdf } = chatbotSlice.actions;
export default chatbotSlice.reducer;
