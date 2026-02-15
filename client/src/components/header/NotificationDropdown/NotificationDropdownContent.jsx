import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Heart,
  Info,
  UserPlus,
  FileText,
  CheckCheck,
  BellRing,
  Circle,
} from "lucide-react";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "../../../app/api/notificationsApi.js";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NotificationDropdownContent = ({ onClose }) => {
  const { data: notifications = [], isLoading } = useGetNotificationsQuery();
  const [markAllRead, { isLoading: isMarkingAllRead }] =
    useMarkAllNotificationsAsReadMutation();
  const [markAsRead] = useMarkNotificationAsReadMutation();

  const handleMarkAllRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await markAllRead().unwrap();
    } catch (err) {
      console.error("❌ Failed to mark notifications as read", err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markAsRead(notif._id).unwrap();
      } catch (err) {
        console.error(`❌ Failed to mark notification as read`, err);
      }
    }
    onClose();
  };

  const getNotificationConfig = (type) => {
    const configs = {
      comment: { icon: MessageCircle },
      like: { icon: Heart },
      follow: { icon: UserPlus },
      post: { icon: FileText },
      system: { icon: Info },
    };
    return configs[type] || configs.system;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const DISPLAY_LIMIT = 10;
  const notificationsToDisplay = [...notifications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, DISPLAY_LIMIT);

  return (
    <div className="flex flex-col max-h-[500px] w-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <Badge
              variant="secondary"
              className="px-2 py-0 h-4 text-[9px] font-black uppercase tracking-widest bg-foreground text-background"
            >
              {unreadCount} NEW
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAllRead}
            className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List Area */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {notificationsToDisplay.length > 0 ? (
            notificationsToDisplay.map((notif, index) => {
              const config = getNotificationConfig(notif.type);
              return (
                <Link
                  key={notif._id}
                  to={notif.link || "#"}
                  onClick={() => handleItemClick(notif)}
                  className={cn(
                    "flex items-start gap-4 p-5 transition-all relative border-b border-border/20 last:border-0",
                    !notif.isRead
                      ? "bg-muted/30"
                      : "hover:bg-muted/10 opacity-70 hover:opacity-100",
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 border rounded-md">
                      <AvatarImage src={notif.relatedUser?.image} />
                      <AvatarFallback className="bg-muted">
                        <BellRing className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 rounded bg-background border p-1">
                      <config.icon className="h-2.5 w-2.5 text-foreground" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-1.5 overflow-hidden">
                    <p
                      className={cn(
                        "text-xs leading-relaxed wrap-break-word",
                        !notif.isRead
                          ? "font-bold text-foreground"
                          : "text-muted-foreground font-medium",
                      )}
                    >
                      {notif.message}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                      {formatTimeAgo(notif.createdAt)}
                    </p>
                  </div>

                  {!notif.isRead && (
                    <div className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                  )}
                </Link>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                All caught up
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border/40">
        <Button
          variant="outline"
          asChild
          className="w-full h-10 text-[9px] font-black uppercase tracking-[0.2em] border-2"
        >
          <Link to="/notifications" onClick={onClose}>
            View all activity
          </Link>
        </Button>
      </div>
    </div>
  );
};

function formatTimeAgo(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 84600) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default NotificationDropdownContent;
