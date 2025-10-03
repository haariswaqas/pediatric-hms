// src/store/admin/systemLogSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import SystemLogService from '../../services/admin/SystemLogService';

export const fetchSystemLogs = createAsyncThunk(
  'systemLogs/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await SystemLogService.fetchSystemLogs(token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// New thunk for deletion
export const deleteSystemLog = createAsyncThunk(
  'systemLogs/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      await SystemLogService.deleteSystemLog(id, token);
      return id;  // return the deleted log's ID
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const systemLogSlice = createSlice({
  name: 'systemLogs',
  initialState: {
    logs: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
        state.loading = false;
      })
      .addCase(fetchSystemLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteSystemLog.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteSystemLog.fulfilled, (state, action) => {
        state.logs = state.logs.filter((log) => log.id !== action.payload);
      })
      .addCase(deleteSystemLog.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default systemLogSlice.reducer;
