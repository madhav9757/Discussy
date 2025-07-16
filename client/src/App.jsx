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
  const userInfo = useSelector((state) => state.auth.userInfo);

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

  // ✅ Fetch notifications only when user is logged in
  const {
    data: fetchedNotifications,
    isError,
    error,
    refetch: refetchNotifications
  } = useGetNotificationsQuery(undefined, {
    skip: !userInfo?._id,
    pollingInterval: 30000, // Poll every 30 seconds as backup
  });

  // ✅ WebSocket setup for real-time notifications
  useEffect(() => {
    if (userInfo?._id) {
      console.log('🔌 Connecting user to socket:', userInfo._id);
      
      // Join the user to their notification room
      socket.emit('join', userInfo._id);
      
      // Listen for new notifications
      const handleNewNotification = (newNotif) => {
        console.log('📨 New notification received:', newNotif);
        
        // Show toast notification
        toast.success(newNotif.message, {
          duration: 4000,
          position: 'top-right',
        });

        // Update RTK Query cache by adding new notification to the beginning
        dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            // Check if notification already exists to prevent duplicates
            const exists = draft.find(n => n._id === newNotif._id);
            if (!exists) {
              draft.unshift(newNotif);
            }
          })
        );
      };

      // Listen for notifications marked as read
      const handleNotificationsMarkedRead = () => {
        console.log('✅ All notifications marked as read');
        dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            draft.forEach((notif) => (notif.isRead = true));
          })
        );
      };

      // Listen for single notification marked as read
      const handleNotificationRead = (notificationId) => {
        console.log('✅ Notification marked as read:', notificationId);
        dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            const notification = draft.find(n => n._id === notificationId);
            if (notification) {
              notification.isRead = true;
            }
          })
        );
      };

      socket.on('notification', handleNewNotification);
      socket.on('notificationsMarkedRead', handleNotificationsMarkedRead);
      socket.on('notificationRead', handleNotificationRead);

      // Cleanup on unmount or user change
      return () => {
        console.log('🔌 Disconnecting user from socket:', userInfo._id);
        socket.off('notification', handleNewNotification);
        socket.off('notificationsMarkedRead', handleNotificationsMarkedRead);
        socket.off('notificationRead', handleNotificationRead);
        socket.emit('leave', userInfo._id);
      };
    }
  }, [userInfo?._id, dispatch]);

  // ✅ Handle socket connection status
  useEffect(() => {
    const handleConnect = () => {
      console.log('🔌 Socket connected');
      if (userInfo?._id) {
        socket.emit('join', userInfo._id);
      }
    };

    const handleDisconnect = () => {
      console.log('🔌 Socket disconnected');
    };

    const handleReconnect = () => {
      console.log('🔌 Socket reconnected');
      if (userInfo?._id) {
        socket.emit('join', userInfo._id);
        // Refetch notifications on reconnect to sync
        refetchNotifications();
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
    };
  }, [userInfo?._id, refetchNotifications]);

  return (
    <ThemeProvider>
      <div className="app-wrapper">
        <Header />
        <main className="main-content">
          <AppRouter />
        </main>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </ThemeProvider>
  );
}

export default App;