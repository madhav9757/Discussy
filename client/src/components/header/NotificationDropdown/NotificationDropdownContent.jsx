import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Heart, 
  Info, 
  UserPlus, 
  FileText, 
  CheckCheck, 
  BellRing 
} from 'lucide-react';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation
} from '../../../app/api/notificationsApi.js';

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NotificationDropdownContent = ({ onClose }) => {
  const { data: notifications = [], isLoading } = useGetNotificationsQuery();
  const [markAllRead, { isLoading: isMarkingAllRead }] = useMarkAllNotificationsAsReadMutation();
  const [markAsRead] = useMarkNotificationAsReadMutation();

  const handleMarkAllRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await markAllRead().unwrap();
    } catch (err) {
      console.error('❌ Failed to mark notifications as read', err);
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
      comment: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
      like: { icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
      follow: { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
      post: { icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
      system: { icon: Info, color: "text-slate-500", bg: "bg-slate-500/10" },
    };
    return configs[type] || configs.system;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const DISPLAY_LIMIT = 15;
  const notificationsToDisplay = [...notifications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, DISPLAY_LIMIT);

  return (
    <div className="flex flex-col max-h-[500px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] font-bold">
              {unreadCount} NEW
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllRead}
            disabled={isMarkingAllRead}
            className="h-8 text-xs text-muted-foreground hover:text-primary"
          >
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* List Area */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {notificationsToDisplay.length > 0 ? (
            notificationsToDisplay.map((notif, index) => {
              const config = getNotificationConfig(notif.type);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  key={notif._id}
                >
                  <Link
                    to={notif.link || '#'}
                    onClick={() => handleItemClick(notif)}
                    className={cn(
                      "flex items-start gap-3 p-4 transition-colors hover:bg-muted/50 border-b border-border/50 last:border-0",
                      !notif.isRead && "bg-primary/[0.02]"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10 border shadow-sm">
                        <AvatarImage 
                          src={notif.relatedUser?.username
                            ? `https://api.dicebear.com/7.x/pixel-art/svg?seed=${notif.relatedUser.username}`
                            : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${notif.type}`
                          } 
                        />
                        <AvatarFallback><BellRing className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 rounded-full p-1 border shadow-sm",
                        config.bg
                      )}>
                        <config.icon className={cn("h-2.5 w-2.5", config.color)} />
                      </div>
                    </div>

                    <div className="flex-1 space-y-1 overflow-hidden">
                      <p className={cn(
                        "text-sm leading-snug break-words",
                        !notif.isRead ? "font-semibold text-foreground" : "text-muted-foreground"
                      )}>
                        {notif.message}
                      </p>
                      <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                        {formatTimeAgo(notif.createdAt)}
                      </p>
                    </div>

                    {!notif.isRead && (
                      <div className="mt-2 h-2 w-2 rounded-full bg-primary shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    )}
                  </Link>
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <BellRing className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">
                New notifications will appear here.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t bg-muted/10">
        <Button variant="ghost" asChild className="w-full h-9 text-xs font-medium">
          <Link to="/notifications" onClick={onClose}>
            View all notifications
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

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 84600) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default NotificationDropdownContent;