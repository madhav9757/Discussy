import { configureStore } from '@reduxjs/toolkit';
import { discusslyApi } from './api/discusslyApi';
import authReducer from '../features/auth/authSlice';

const store = configureStore({
  reducer: {
    [discusslyApi.reducerPath]: discusslyApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(discusslyApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
