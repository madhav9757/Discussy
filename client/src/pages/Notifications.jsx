import React, { useState, useMemo } from "react";
import { useGetNotificationsQuery } from "../app/api/notificationsApi";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Loader2,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

/* ── Notification type → icon + color map ── */
const TYPE_MAP = {
  upvote: {
    Icon: ArrowUpCircle,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  comment: {
    Icon: MessageCircle,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  follow: { Icon: UserPlus, color: "text-green-400", bg: "bg-green-400/10" },
  mention: { Icon: AtSign, color: "text-purple-400", bg: "bg-purple-400/10" },
  community: { Icon: Hash, color: "text-primary", bg: "bg-primary/10" },
  like: { Icon: Heart, color: "text-rose-400", bg: "bg-rose-400/10" },
  system: { Icon: Info, color: "text-muted-foreground", bg: "bg-muted/60" },
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
  <div className="flex items-start gap-4 p-4 bg-card border border-border/50 rounded-2xl animate-pulse">
    <Skeleton className="w-9 h-9 rounded-xl shrink-0 mt-0.5" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-1/2 rounded" />
      <Skeleton className="h-3 w-3/4 rounded" />
    </div>
    <Skeleton className="h-3 w-12 rounded shrink-0 mt-1" />
  </div>
);

/* ── Single notification row ── */
const NotifRow = ({ notification, onMarkRead }) => {
  const { Icon, color, bg } = getType(notification);
  const unread = !notification.isRead;

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer",
        unread
          ? "bg-primary/3 border-primary/20 hover:border-primary/40 hover:shadow-sm"
          : "bg-card border-border/50 hover:border-border hover:shadow-sm",
      )}
      onClick={() => !unread || onMarkRead?.(notification._id)}
    >
      {/* Unread left bar */}
      {unread && (
        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-primary" />
      )}

      {/* Icon bubble */}
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
          bg,
        )}
      >
        <Icon size={16} strokeWidth={2} className={color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              "text-[13.5px] leading-snug font-semibold",
              unread ? "text-foreground" : "text-foreground/75",
            )}
          >
            {notification.title || "Notification"}
          </p>
          <span className="text-[11px] text-muted-foreground/50 font-medium shrink-0 mt-0.5">
            {relativeTime(notification.createdAt || Date.now())}
          </span>
        </div>
        <p className="text-[12.5px] text-muted-foreground/80 leading-relaxed">
          {notification.message}
        </p>
      </div>

      {/* Unread dot */}
      {unread && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2 animate-pulse" />
      )}

      {/* Mark read on hover (only for unread) */}
      {unread && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead?.(notification._id);
          }}
          className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10.5px] font-semibold text-muted-foreground hover:text-foreground"
        >
          <Check size={11} strokeWidth={2.5} /> Mark read
        </button>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════ */
const Notifications = () => {
  const { data: notifications, isLoading } = useGetNotificationsQuery();
  const [filter, setFilter] = useState("all");

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

  /* Handlers — wire to your mutations */
  const handleMarkRead = (id) => console.log("mark read", id);
  const handleMarkAll = () => console.log("mark all read");
  const handleClearAll = () => console.log("clear all");

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Bell size={22} strokeWidth={2.5} className="text-primary" />
            Notifications
          </h1>
          {unreadCount > 0 && (
            <Badge className="rounded-full px-2 py-0.5 text-[11px] font-black bg-primary text-primary-foreground">
              {unreadCount}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAll}
              className="h-8 px-3 rounded-xl text-[12px] font-semibold gap-1.5"
            >
              <CheckCheck size={13} strokeWidth={2} />
              <span className="hidden sm:inline">Mark all read</span>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-xl"
              >
                <Filter size={13} strokeWidth={2} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-44 rounded-xl p-1.5 border-border/50 shadow-xl"
            >
              <DropdownMenuItem
                className="rounded-lg px-3 py-2 text-[12.5px] font-semibold gap-2.5 cursor-pointer focus:bg-accent"
                onClick={handleMarkAll}
              >
                <CheckCheck size={13} className="text-muted-foreground" /> Mark
                all read
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-lg px-3 py-2 text-[12.5px] font-semibold gap-2.5 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={handleClearAll}
              >
                <Trash2 size={13} /> Clear all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-1 bg-card border border-border/50 rounded-xl p-1 shadow-sm">
        {FILTER_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={cn(
              "flex-1 py-2 rounded-lg text-[12.5px] font-semibold transition-all duration-150",
              filter === id
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            {label}
            {id === "unread" && unreadCount > 0 && (
              <span
                className={cn(
                  "ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full",
                  filter === "unread"
                    ? "bg-background/20 text-background"
                    : "bg-primary/10 text-primary",
                )}
              >
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      <div className="space-y-2">
        {/* Loading */}
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => <NotifSkeleton key={i} />)}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 bg-card border border-dashed border-border/60 rounded-2xl text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center">
              <BellOff className="w-7 h-7 text-muted-foreground/30" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground/70">
                {filter === "unread"
                  ? "No unread notifications"
                  : "You're all caught up"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {filter === "unread"
                  ? "All notifications have been read."
                  : "New activity will appear here."}
              </p>
            </div>
            {filter !== "all" && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl text-xs font-semibold"
                onClick={() => setFilter("all")}
              >
                View all
              </Button>
            )}
          </div>
        )}

        {/* Group by date */}
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
              <div key={label} className="space-y-2">
                <div className="flex items-center gap-3 px-1 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
                    {label}
                  </span>
                  <div className="flex-1 h-px bg-border/40" />
                </div>
                {items.map((n) => (
                  <NotifRow
                    key={n._id}
                    notification={n}
                    onMarkRead={handleMarkRead}
                  />
                ))}
              </div>
            ));
          })()}
      </div>
    </div>
  );
};

export default Notifications;
