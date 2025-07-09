import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../app/constant.js';
// Import your base RTK Query API slice to access its utility methods
import { discusslyApi } from '../../app/api/discusslyApi.js'; // <-- IMPORTANT: Make sure this path is correct

// Load user info from localStorage on app start
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

// Load token from localStorage on app start (crucial for authenticated requests)
const tokenFromStorage = localStorage.getItem('token')
  ? localStorage.getItem('token')
  : null;

const initialState = {
  userInfo: userInfoFromStorage,
  token: tokenFromStorage, // Store the token in Redux state
  isLoading: false,
  error: null,
};

// 🔐 LOGIN
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/users/login`, formData, {
        withCredentials: true,
      });

      // Ensure that res.data and res.data.user are valid before storing
      if (!res.data || !res.data.user) {
        throw new Error('Login response missing user data.');
      }
      if (!res.data.token) {
        throw new Error('Login response missing authentication token.');
      }

      // Store both userInfo and token in localStorage
      localStorage.setItem('userInfo', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);

      // Manually invalidate the RTK Query cache for the 'User' tag.
      // This tells RTK Query that any cached 'User' data (like from useGetProfileQuery) is stale
      // and needs to be refetched on its next access.
      thunkAPI.dispatch(discusslyApi.util.invalidateTags(['User']));

      // Return both user and token for the fulfilled action payload
      return { user: res.data.user, token: res.data.token };
    } catch (err) {
      console.error("Login Thunk Error:", err);
      // Clean up localStorage on failed login attempts to avoid stale data
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || 'Login failed'
      );
    }
  }
);

// 📝 REGISTER
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/users/register`, formData, {
        withCredentials: true,
      });

      // Ensure that res.data and res.data.user are valid before storing
      if (!res.data || !res.data.user) {
        throw new Error('Registration response missing user data.');
      }
      if (!res.data.token) {
        throw new Error('Registration response missing authentication token.');
      }

      // Store both userInfo and token in localStorage
      localStorage.setItem('userInfo', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);

      // Manually invalidate the RTK Query cache for the 'User' tag
      thunkAPI.dispatch(discusslyApi.util.invalidateTags(['User']));

      // Return both user and token for the fulfilled action payload
      return { user: res.data.user, token: res.data.token };
    } catch (err) {
      console.error("Register Thunk Error:", err);
      // Clean up localStorage on failed registration attempts
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || 'Registration failed'
      );
    }
  }
);

// 🔓 LOGOUT
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, thunkAPI) => {
    try {
      // Assuming your backend's logout endpoint correctly clears HTTP-only cookies
      await axios.post(`${API_BASE_URL}/users/logout`, {}, { withCredentials: true });

      // Remove both userInfo and token from localStorage
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');

      // Manually invalidate the RTK Query cache for the 'User' tag
      thunkAPI.dispatch(discusslyApi.util.invalidateTags(['User']));

      return true; // Indicate success
    } catch (err) {
      console.error("Logout Thunk Error:", err);
      // Even if logout fails on the backend, ensure local state is cleared
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || 'Logout failed'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    // This reducer can be used to set credentials from other sources if needed
    // (e.g., if you fetch user info from a non-auth endpoint and want to populate auth state)
    setCredentials: (state, action) => {
      state.userInfo = action.payload.user;
      state.token = action.payload.token;
      // Ensure localStorage is updated here too, if this reducer is used directly
      localStorage.setItem('userInfo', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
      // You might also dispatch invalidateTags(['User']) here if this action can imply a new user context
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userInfo = action.payload.user; // Access user from payload
        state.token = action.payload.token; // Access token from payload
        // localStorage.setItem is already handled in the async thunk above
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.userInfo = null; // Clear userInfo in state on rejection
        state.token = null; // Clear token in state on rejection
        // localStorage.removeItem is already handled in the async thunk above
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userInfo = action.payload.user; // Access user from payload
        state.token = action.payload.token; // Access token from payload
        // localStorage.setItem is already handled in the async thunk above
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.userInfo = null; // Clear userInfo in state on rejection
        state.token = null; // Clear token in state on rejection
        // localStorage.removeItem is already handled in the async thunk above
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.userInfo = null;
        state.token = null; // Clear token in state
        state.isLoading = false;
        state.error = null;
        // localStorage.removeItem is already handled in the async thunk above
      })
      .addCase(logoutUser.rejected, (state, action) => { // Added rejected case for logout
        state.isLoading = false;
        state.error = action.payload;
        state.userInfo = null; // Clear userInfo even if backend logout failed, to ensure local consistency
        state.token = null; // Clear token
        // localStorage.removeItem is already handled in the async thunk above
      });
  },
});

export const { clearAuthError, setCredentials } = authSlice.actions;
export default authSlice.reducer;