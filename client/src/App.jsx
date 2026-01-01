import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

import AppRouter from "./router.jsx";
import Header from "./components/header/Header.jsx";
import { setCredentials } from "./features/auth/authSlice.js";
import { notificationsApi, useGetNotificationsQuery } from "./app/api/notificationsApi.js";

import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import socket from "./socket";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const userInfo = useSelector((state) => state.auth.userInfo);

  // Sync Auth State
  useEffect(() => {
    try {
      const user = localStorage.getItem("userInfo");
      const token = localStorage.getItem("token");
      if (user && token) {
        dispatch(
          setCredentials({
            user: JSON.parse(user),
            token,
          })
        );
      }
    } catch {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
    }
  }, [dispatch]);

  // Notifications Sync
  const { refetch } = useGetNotificationsQuery(undefined, {
    skip: !userInfo?._id,
    pollingInterval: 30000,
    refetchOnMountOrArgChange: true,
  });

  // Socket Logic
  useEffect(() => {
    if (!userInfo?._id) return;

    socket.emit("join", userInfo._id);

    const onNotification = (notification) => {
      // Enhanced Shadcn Toast
      toast.message("New Notification", {
        description: notification.message,
      });

      dispatch(
        notificationsApi.util.updateQueryData("getNotifications", undefined, (draft) => {
          if (!draft.find((n) => n._id === notification._id)) {
            draft.unshift(notification);
          }
        })
      );
    };

    const onReadAll = () => {
      dispatch(
        notificationsApi.util.updateQueryData("getNotifications", undefined, (draft) => {
          draft.forEach((n) => (n.isRead = true));
        })
      );
    };

    const onReadOne = (id) => {
      dispatch(
        notificationsApi.util.updateQueryData("getNotifications", undefined, (draft) => {
          const n = draft.find((x) => x._id === id);
          if (n) n.isRead = true;
        })
      );
    };

    socket.on("notification", onNotification);
    socket.on("notificationsMarkedRead", onReadAll);
    socket.on("notificationRead", onReadOne);

    return () => {
      socket.emit("leave", userInfo._id);
      socket.off("notification", onNotification);
      socket.off("notificationsMarkedRead", onReadAll);
      socket.off("notificationRead", onReadOne);
    };
  }, [userInfo?._id, dispatch]);

  useEffect(() => {
    const onReconnect = () => {
      if (userInfo?._id) {
        socket.emit("join", userInfo._id);
        refetch();
      }
    };

    socket.on("reconnect", onReconnect);
    return () => socket.off("reconnect", onReconnect);
  }, [userInfo?._id, refetch]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <div className="relative min-h-screen bg-background font-sans antialiased flex flex-col selection:bg-primary/10 selection:text-primary">
        
        <Header />

        <div className="flex-1 flex flex-col relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ 
                duration: 0.2, 
                ease: [0.23, 1, 0.32, 1] // Native-feeling cubic bezier
              }}
              className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
              <AppRouter />
            </motion.main>
          </AnimatePresence>
        </div>

        {/* Shadcn UI Toaster */}
        <Toaster closeButton richColors position="bottom-right" />
        
      </div>
    </ThemeProvider>
  );
}

export default App;