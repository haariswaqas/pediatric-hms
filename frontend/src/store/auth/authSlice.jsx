// src/store/auth/authSlice.jsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {jwtDecode} from 'jwt-decode';
import AuthService from '../../services/AuthService';

// Load token from storage
const tokenFromStorage = localStorage.getItem('access');
let decodedUser = null;

if (tokenFromStorage) {
  try {
    decodedUser = jwtDecode(tokenFromStorage);
    if (decodedUser.exp * 1000 < Date.now()) {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      decodedUser = null;
    }
  } catch {
    decodedUser = null;
  }
}

// Initial state
const initialState = {
  isAuthenticated: Boolean(decodedUser),
  user: decodedUser,
  access: tokenFromStorage,
  refresh: localStorage.getItem('refresh'),
  loading: false,
  error: null,
};

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
)

// Async thunk for refreshing tokens
export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (refreshToken, { rejectWithValue }) => {
    try {
      const response = await AuthService.refreshToken(refreshToken);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      const { access, refresh } = action.payload;
      const user = jwtDecode(access);

      state.isAuthenticated = true;
      state.user = user;
      state.access = access;
      state.refresh = refresh;

      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.access = null;
      state.refresh = null;

      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        const { access, refresh: newRefresh } = action.payload;
        const user = jwtDecode(access);

        state.access = access;
        state.refresh = newRefresh; // update rotated refresh token
        state.user = user;
        state.isAuthenticated = true;

        localStorage.setItem('access', access);
        localStorage.setItem('refresh', newRefresh);
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.access = null;
        state.refresh = null;

        localStorage.removeItem('access');
        localStorage.removeItem('refresh');

        state.error = action.payload;
      });
  },
});

export const selectUserRole = (state) => state.auth.user?.role;
export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
