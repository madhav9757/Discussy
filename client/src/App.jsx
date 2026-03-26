import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import AppRouter from "./router.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import Header from "./components/header/Header.jsx";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import { setCredentials } from "./features/auth/authSlice.js";
import {
  notificationsApi,
  useGetNotificationsQuery,
} from "./app/api/notificationsApi.js";
import socket from "./socket";

const useNotificationSocket = (userInfo) => {
  const dispatch = useDispatch();

  const { refetch } = useGetNotificationsQuery(undefined, {
    skip: !userInfo?._id,
    pollingInterval: 30000,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (!userInfo?._id) return;

    socket.emit("join", userInfo._id);

    const onNotification = (notification) => {
      toast.message("Notification", { description: notification.message });

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

    const onReconnect = () => {
      socket.emit("join", userInfo._id);
      refetch();
    };

    socket.on("notification", onNotification);
    socket.on("notificationsMarkedRead", onReadAll);
    socket.on("notificationRead", onReadOne);
    socket.on("reconnect", onReconnect);

    return () => {
      socket.emit("leave", userInfo._id);
      socket.off("notification", onNotification);
      socket.off("notificationsMarkedRead", onReadAll);
      socket.off("notificationRead", onReadOne);
      socket.off("reconnect", onReconnect);
    };
  }, [userInfo?._id, dispatch, refetch]);
};

function App() {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.auth.userInfo);

  useNotificationSocket(userInfo);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("userInfo");
      const token = localStorage.getItem("token");

      if (userStr && token) {
        dispatch(
          setCredentials({
            user: JSON.parse(userStr),
            token,
          }),
        );
      }
    } catch (error) {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
    }
  }, [dispatch]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <Header />

        <main className="flex-1 flex flex-col w-full mx-auto">
          <AppRouter />
        </main>

        <Toaster closeButton position="bottom-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;
