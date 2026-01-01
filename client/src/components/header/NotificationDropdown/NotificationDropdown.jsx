import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useGetNotificationsQuery } from '../../../app/api/notificationsApi.js';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NotificationDropdownContent from './NotificationDropdownContent';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { data: notifications = [] } = useGetNotificationsQuery();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleTriggerClick = (e) => {
    // Check for mobile width
    if (window.innerWidth <= 768) {
      e.preventDefault();
      navigate('/notifications');
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full transition-colors hover:bg-muted"
          onClick={handleTriggerClick}
          aria-label={`You have ${unreadCount} new notifications`}
        >
          <Bell 
            className={cn(
              "h-5 w-5 transition-colors",
              unreadCount > 0 ? "text-primary fill-primary/10" : "text-muted-foreground"
            )} 
          />
          
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary text-[10px] font-bold text-primary-foreground items-center justify-center border-2 border-background">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        align="end" 
        className="w-80 md:w-[380px] p-0 shadow-xl border-border rounded-xl overflow-hidden hidden md:block"
        sideOffset={8}
      >
        <NotificationDropdownContent onClose={() => {
          // The Popover component handles closure automatically when clicking outside
          // but we can trigger manual close here if NotificationDropdownContent provides a hook
        }} />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;