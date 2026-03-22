import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import AppRouter from "./router.jsx";
import Header from "./components/header/Header.jsx";
import { setCredentials } from "./features/auth/authSlice.js";
import {
  notificationsApi,
  useGetNotificationsQuery,
} from "./app/api/notificationsApi.js";

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
          }),
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
      toast.message("Notification", {
        description: notification.message,
        className: "font-bold uppercase text-[10px] tracking-widest border-2",
      });

      dispatch(
        notificationsApi.util.updateQueryData(
          "getNotifications",
          undefined,
          (draft) => {
            if (!draft.find((n) => n._id === notification._id)) {
              draft.unshift(notification);
            }
          },
        ),
      );
    };

    const onReadAll = () => {
      dispatch(
        notificationsApi.util.updateQueryData(
          "getNotifications",
          undefined,
          (draft) => {
            draft.forEach((n) => (n.isRead = true));
          },
        ),
      );
    };

    const onReadOne = (id) => {
      dispatch(
        notificationsApi.util.updateQueryData(
          "getNotifications",
          undefined,
          (draft) => {
            const n = draft.find((x) => x._id === id);
            if (n) n.isRead = true;
          },
        ),
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
      <div className="h-screen w-screen bg-muted/30 dark:bg-muted/5 flex items-center justify-center overflow-hidden">
        <div className="h-full w-full bg-background border-x border-border/40 shadow-[0_0_50px_-12px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden relative">
          <Header />

          <main className="flex-1 overflow-hidden w-full relative selection:bg-primary/10">
            <AppRouter />
          </main>

          <Toaster
            closeButton
            richColors
            position="bottom-right"
            toastOptions={{
              className: "border border-border/50 shadow-xl rounded-2xl",
            }}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
