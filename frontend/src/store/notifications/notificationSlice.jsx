// src/store/notifications/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import NotificationService from '../../services/NotificationService';

// Thunk for fetching notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const incoming = await NotificationService.fetchNotifications(token);

      // Detect new notifications
      const previous = getState().notifications.notifications;
      const newNotifications = incoming.filter(i =>
        !previous.some(p => p.id === i.id)
      );
      newNotifications.forEach(n => {
        toast.info(n.title || n.message, {
          onClick: () => {
            // Optionally dispatch readNotification here
            // dispatch(readNotification(n.id));
          }
        });
      });

      return incoming;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk for marking a notification as read
export const readNotification = createAsyncThunk(
  'notifications/readNotification',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const data = await NotificationService.readNotification(id, token);
      return { id, data };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(readNotification.fulfilled, (state, action) => {
        const { id } = action.payload;
        const notification = state.notifications.find((n) => n.id === id);
        if (notification) {
          notification.read = true;
        }
        toast.success('Notification marked as read');
      });
  },
});

export default notificationSlice.reducer;
