// src/App.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppRouter from './router.jsx';
import Header from './components/header/Header.jsx';
import { setCredentials } from './features/auth/authSlice.js';
import { ToastContainer } from 'react-toastify';
import { Toaster, toast } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';

import { ThemeProvider } from './context/ThemeContext';
import socket from './socket';

import {
  useGetNotificationsQuery,
  notificationsApi,
} from './app/api/notificationsApi.js';

function App() {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.auth.user);

  // ✅ Load credentials on mount
  useEffect(() => {
    const getUserInfoFromStorage = () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        const token = localStorage.getItem('token');
        if (userInfo && token && userInfo !== 'undefined' && token !== 'undefined') {
          return {
            user: JSON.parse(userInfo),
            token,
          };
        }
        return null;
      } catch (err) {
        console.warn('Invalid userInfo in storage:', err);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        return null;
      }
    };

    const userData = getUserInfoFromStorage();
    if (userData) {
      dispatch(setCredentials(userData));
    }
  }, [dispatch]);

  // ✅ Fetch notifications once (cached by RTK Query)
  const {
    data: fetchedNotifications,
    isError,
    error,
  } = useGetNotificationsQuery(undefined, {
    skip: !userInfo?._id,
  });

  // ❌ No setNotifications needed — RTK handles caching

  // ✅ WebSocket setup for real-time notification
  useEffect(() => {
    if (userInfo?._id) {
      socket.emit('join', userInfo._id);
    }

    socket.on('notification', (newNotif) => {
      toast.success(newNotif.message); // Optional toast

      // 👇 Update RTK Query cache directly (no slice)
      dispatch(
        notificationsApi.util.updateQueryData('getNotifications', undefined, (draft) => {
          draft.unshift(newNotif);
        })
      );
    });

    socket.on('notificationsMarkedRead', () => {
      dispatch(
        notificationsApi.util.updateQueryData('getNotifications', undefined, (draft) => {
          draft.forEach((notif) => (notif.isRead = true));
        })
      );
    });

    return () => {
      socket.off('notification');
      socket.off('notificationsMarkedRead');
    };
  }, [userInfo?._id, dispatch]);

  return (
    <ThemeProvider>
      <div className="app-wrapper">
        <Header />
        <main className="main-content">
          <AppRouter />
        </main>
        <Toaster position="top-center" />
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    </ThemeProvider>
  );
}

export default App;
