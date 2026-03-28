import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  useGetNotificationsQuery, 
  useMarkNotificationAsReadMutation, 
  useMarkAllNotificationsAsReadMutation, 
  useDeleteNotificationMutation, 
  useDeleteAllNotificationsMutation 
} from "../app/api/notificationsApi";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ArrowUpCircle,
  MessageCircle,
  UserPlus,
  Hash,
  Heart,
  AtSign,
  Info,
  Trash2,
  Filter,
} from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn, getAvatarUrl } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

/* ── Notification type → icon + color map ── */
const TYPE_MAP = {
  upvote: {
    Icon: ArrowUpCircle,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  comment: {
    Icon: MessageCircle,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  follow: { Icon: UserPlus, color: "text-green-500", bg: "bg-green-500/10" },
  mention: { Icon: AtSign, color: "text-purple-500", bg: "bg-purple-500/10" },
  community: { Icon: Hash, color: "text-primary", bg: "bg-primary/10" },
  like: { Icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  system: { Icon: Info, color: "text-muted-foreground", bg: "bg-muted/20" },
};

const getType = (n) => {
  const t = n.type?.toLowerCase();
  return TYPE_MAP[t] ?? TYPE_MAP.system;
};

/* ── Relative time helper ── */
const relativeTime = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "just now";
  }
};

/* ── Filter tabs ── */
const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
];

/* ── Skeleton row ── */
const NotifSkeleton = () => (
  <Card className="p-4 shadow-none border-border/50 flex items-start gap-4">
    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-3/4" />
    </div>
    <Skeleton className="h-3 w-12 rounded shrink-0" />
  </Card>
);

/* ── Single notification row ── */
const NotifRow = ({ notification, onMarkRead, onDelete }) => {
  const { Icon, color, bg } = getType(notification);
  const unread = !notification.isRead;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card
        className={cn(
          "group relative flex items-start gap-4 p-4 shadow-none border-border/50 transition-colors cursor-pointer overflow-hidden",
          unread
            ? "bg-muted/20 hover:bg-muted/40"
            : "bg-background hover:bg-muted/20",
        )}
        onClick={() => onMarkRead?.(notification._id, true)}
      >
        {/* Unread Indicator Bar */}
        {unread && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
        )}

        {/* Avatar/Icon Bubble */}
        <div className="relative shrink-0">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-border/20 bg-muted/30",
              !notification.relatedUser && bg,
            )}
          >
            {notification.relatedUser ? (
              <img
                src={getAvatarUrl(notification.relatedUser)}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon size={18} className={color} />
            )}
          </div>
          {notification.relatedUser && (
            <div className={cn(
              "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-background shadow-sm",
              bg
            )}>
              <Icon size={10} className={color} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-3">
            <p
              className={cn(
                "text-sm font-semibold truncate",
                unread ? "text-foreground" : "text-foreground/70",
              )}
            >
              {notification.title || "Notification"}
            </p>
            <span className="text-xs text-muted-foreground font-medium shrink-0 pt-0.5">
              {relativeTime(notification.createdAt || Date.now())}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {notification.message}
          </p>
        </div>

        {/* Actions */}
        <div className="absolute right-4 bottom-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {unread && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead?.(notification._id, false);
              }}
              className="h-7 text-xs gap-1.5 px-2 bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background"
            >
              <Check size={14} /> Mark read
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(notification._id);
            }}
            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 bg-background/80 backdrop-blur-sm border shadow-sm"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

/* ════════════════════════════════════════════════════ */
const Notifications = () => {
  const { data: notifications, isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationAsReadMutation();
  const [markAllRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotif] = useDeleteNotificationMutation();
  const [deleteAllNotifs] = useDeleteAllNotificationsMutation();
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const unreadCount = useMemo(
    () => notifications?.filter((n) => !n.isRead).length ?? 0,
    [notifications],
  );

  const filtered = useMemo(() => {
    if (!notifications) return [];
    if (filter === "unread") return notifications.filter((n) => !n.isRead);
    if (filter === "read") return notifications.filter((n) => n.isRead);
    return notifications;
  }, [notifications, filter]);

  /* Handlers */
  const handleMarkRead = async (id, link, shouldNavigate = false) => {
    try {
      await markRead(id).unwrap();
      if (shouldNavigate && link) navigate(link);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead().unwrap();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      try {
        await deleteAllNotifs().unwrap();
      } catch (err) {
        console.error("Failed to clear notifications:", err);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotif(id).unwrap();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-background min-h-0 overflow-hidden font-sans">
      {/* ── Header ── */}
      <header className="shrink-0 px-6 py-4 border-b bg-background flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-md text-foreground relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-background"></span>
              </span>
            )}
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Notifications
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Stay updated with your network
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAll}
              className="h-9 text-xs font-medium gap-2 shadow-none border-border/50"
            >
              <CheckCheck size={14} />
              <span className="hidden sm:inline">Mark all read</span>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shadow-none border-border/50"
              >
                <Filter size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-lg shadow-md border-border/50"
            >
              <DropdownMenuItem
                onClick={handleMarkAll}
                className="text-xs font-medium cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 mr-2 text-muted-foreground" />{" "}
                Mark all read
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleClearAll}
                className="text-xs font-medium text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Clear all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Scrollable Area ── */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          {/* ── Filter Tabs ── */}
          <div className="flex items-center bg-muted/40 p-1 rounded-lg border border-border/40 w-fit">
            {FILTER_TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                  filter === id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
                {id === "unread" && unreadCount > 0 && (
                  <Badge
                    variant={filter === "unread" ? "default" : "secondary"}
                    className="px-1.5 py-0 rounded-full text-[10px] h-4"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* ── Notification List ── */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {/* Loading */}
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <NotifSkeleton key={i} />
                ))}

              {/* Empty State */}
              {!isLoading && filtered.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <BellOff className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {filter === "unread"
                      ? "No unread notifications"
                      : "You're all caught up"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                    {filter === "unread"
                      ? "You have read all your notifications."
                      : "New interactions will appear here."}
                  </p>
                  {filter !== "all" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilter("all")}
                      className="shadow-none"
                    >
                      View all notifications
                    </Button>
                  )}
                </motion.div>
              )}

              {/* Grouped Notifications */}
              {!isLoading &&
                filtered.length > 0 &&
                (() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const yesterday = new Date(today);
                  yesterday.setDate(today.getDate() - 1);

                  const groups = filtered.reduce((acc, n) => {
                    const d = new Date(n.createdAt || Date.now());
                    d.setHours(0, 0, 0, 0);
                    let label = "Earlier";
                    if (d >= today) label = "Today";
                    else if (d >= yesterday) label = "Yesterday";
                    (acc[label] = acc[label] || []).push(n);
                    return acc;
                  }, {});

                  return Object.entries(groups).map(([label, items]) => (
                    <div key={label} className="space-y-3 pt-2 first:pt-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {label}
                        </span>
                        <Separator className="flex-1" />
                      </div>
                      <div className="space-y-2">
                        {items.map((n) => (
                          <NotifRow
                            key={n._id}
                            notification={n}
                            onMarkRead={(id, navigate) => handleMarkRead(id, n.link, navigate)}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    </div>
                  ));
                })()}
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Notifications;
