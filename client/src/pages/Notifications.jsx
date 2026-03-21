import React from 'react';
import { useGetNotificationsQuery } from '../app/api/notificationsApi';
import { Bell, CheckSquare, Loader2 } from 'lucide-react';

const Notifications = () => {
  const { data: notifications, isLoading } = useGetNotificationsQuery();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bell size={24} className="text-primary" />
          Notifications
        </h1>
        <button className="text-sm font-medium hover:text-primary text-muted-foreground flex items-center gap-1.5 transition-colors">
          <CheckSquare size={16} /> Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/50" />
          </div>
        )}

        {!isLoading && (!notifications || notifications.length === 0) && (
          <div className="py-20 text-center text-sm text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border/50">
            You're all caught up! No new notifications.
          </div>
        )}

        {notifications?.map((notification) => (
          <div 
            key={notification._id} 
            className={`p-5 flex items-start gap-4 transition-all duration-200 rounded-2xl border ${
              notification.isRead 
                ? 'bg-card border-border/40 hover:border-border/60 hover:shadow-sm' 
                : 'bg-primary/5 border-primary/20 shadow-sm'
            }`}
          >
            <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
              !notification.isRead ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'
            }`}></div>
            <div className="flex-1 space-y-1.5 min-w-0">
              <p className={`text-base leading-tight ${!notification.isRead ? 'font-bold text-foreground' : 'font-medium text-foreground/90'}`}>
                {notification.title || 'Notification'}
              </p>
              <p className="text-sm text-muted-foreground/90 font-normal">
                {notification.message}
              </p>
              <div className="text-xs text-muted-foreground/70 pt-1 font-medium">
                {new Date(notification.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                <span className="mx-2 opacity-50">•</span> 
                {new Date(notification.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
