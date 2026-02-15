import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Bell,
  MessageCircle,
  Heart,
  UserPlus,
  FileText,
  Info,
  CheckCheck,
  ExternalLink,
  Inbox,
} from "lucide-react";

import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/app/api/notificationsApi";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const iconMap = {
  comment: MessageCircle,
  like: Heart,
  follow: UserPlus,
  post: FileText,
  system: Info,
};

const NotificationsPage = () => {
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useGetNotificationsQuery();
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllRead, { isLoading: markingAll }] =
    useMarkAllNotificationsAsReadMutation();

  if (isLoading)
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-pulse">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Loading Activity...
        </p>
      </div>
    );
  if (error) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {unreadCount > 0
                ? `${unreadCount} unread alerts`
                : "No new activity"}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              disabled={markingAll}
              onClick={() => markAllRead()}
              className="h-9 px-4 text-xs font-bold border-2"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-2" />
              Mark all as read
            </Button>
          )}
        </header>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const Icon = iconMap[n.type] || iconMap.system;

                return (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card
                      className={cn(
                        "group shadow-none border border-border/50 transition-colors rounded-md",
                        !n.isRead
                          ? "bg-muted/30"
                          : "bg-transparent hover:bg-muted/10",
                      )}
                      onClick={() => !n.isRead && markAsRead(n._id)}
                    >
                      <CardContent className="flex items-start gap-4 p-4">
                        <div className="mt-0.5 h-8 w-8 rounded bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm leading-relaxed",
                              !n.isRead
                                ? "font-bold text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {n.message}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tight">
                              {formatTimeAgo(n.createdAt)}
                            </span>
                            {n.link && (
                              <Link
                                to={n.link}
                                className="text-[10px] text-foreground font-black uppercase tracking-widest hover:underline flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View <ExternalLink className="h-2.5 w-2.5" />
                              </Link>
                            )}
                          </div>
                        </div>

                        {!n.isRead && (
                          <div className="h-1.5 w-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed rounded-md bg-muted/5">
                <Inbox className="h-8 w-8 text-muted-foreground/20 mb-3" />
                <h3 className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Inbox is empty
                </h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

function formatTimeAgo(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default NotificationsPage;
