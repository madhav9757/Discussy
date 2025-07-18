// src/components/notifications/NotificationDropdownContent.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Info, UserPlus, FileText } from 'lucide-react';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation // Import this hook
} from '../../../app/api/notificationsApi.js';
import './NotificationDropdown.css';

const NotificationDropdownContent = ({ onClose }) => {
  const { data: notifications = [], isLoading, error } = useGetNotificationsQuery();
  const [markAllRead, { isLoading: isMarkingAllRead }] = useMarkAllNotificationsAsReadMutation();
  const [markAsRead] = useMarkNotificationAsReadMutation(); // Initialize the mutation hook

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      console.log('✅ All notifications marked as read');
    } catch (err) {
      console.error('❌ Failed to mark notifications as read', err);
    }
  };

  // New function to mark an individual notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId).unwrap(); // Use .unwrap() to catch errors
      console.log(`✅ Notification ${notificationId} marked as read`);
    } catch (err) {
      console.error(`❌ Failed to mark notification ${notificationId} as read`, err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'comment':
        return <MessageCircle size={12} />;
      case 'like':
        return <Heart size={12} />;
      case 'follow':
        return <UserPlus size={12} />;
      case 'post':
        return <FileText size={12} />;
      case 'system':
      default:
        return <Info size={12} />;
    }
  };

  const getNotificationTypeClass = (type) => {
    switch (type) {
      case 'comment':
        return 'notification-item-type--comment';
      case 'like':
        return 'notification-item-type--like';
      case 'follow':
        return 'notification-item-type--follow';
      case 'post':
        return 'notification-item-type--post';
      case 'system':
      default:
        return 'notification-item-type--system';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const unreadNotifications = sortedNotifications.filter(n => !n.isRead);
  const readNotifications = sortedNotifications.filter(n => n.isRead);

  const DISPLAY_LIMIT = 15; // Set a reasonable display limit for the dropdown. You can adjust this.

  let notificationsToDisplay = [];

  // Add all unread notifications first
  notificationsToDisplay = [...unreadNotifications];

  // Fill remaining slots with recent read notifications if available
  const remainingSlots = DISPLAY_LIMIT - notificationsToDisplay.length;
  if (remainingSlots > 0) {
    notificationsToDisplay = [
      ...notificationsToDisplay,
      ...readNotifications.slice(0, remainingSlots)
    ];
  }
  // Ensure the final list doesn't exceed the display limit
  notificationsToDisplay = notificationsToDisplay.slice(0, DISPLAY_LIMIT);


  return (
    <>
      <div className="notifications-dropdown-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <button
            className="notifications-dropdown-mark-all"
            onClick={handleMarkAllRead}
            disabled={isMarkingAllRead}
          >
            {isMarkingAllRead ? 'Marking...' : `Mark all read (${unreadCount})`}
          </button>
        )}
      </div>

      <div className="notifications-dropdown-list">
        {notificationsToDisplay.length > 0 ? (
          notificationsToDisplay.map((notif) => (
            <Link
              to={notif.link || '#'}
              key={notif._id}
              className={`notification-item ${!notif.isRead ? 'notification-item--unread' : ''}`}
              onClick={(e) => {
                // Prevent event bubbling if the link itself is clicked directly
                // and ensure the dropdown closes *after* the navigation happens or is initiated.
                if (!notif.isRead) {
                  handleMarkAsRead(notif._id);
                }
                onClose(); // Close the dropdown after interaction
              }}
            >
              <div className="notification-item-avatar">
                <img
                  src={notif.relatedUser?.username
                    ? `https://api.dicebear.com/7.x/pixel-art/svg?seed=${notif.relatedUser.username}`
                    : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${notif.type}`
                  }
                  alt="User avatar"
                />
                <div className={`notification-item-type ${getNotificationTypeClass(notif.type)}`}>
                  {getNotificationIcon(notif.type)}
                </div>
              </div>
              <div className="notification-item-content">
                <p className="notification-item-message">{notif.message}</p>
                <span className="notification-item-time">
                  {formatTimeAgo(notif.createdAt)}
                </span>
              </div>
              {!notif.isRead && <div className="notification-item-unread-dot" />}
            </Link>
          ))
        ) : (
          <div className="modal-empty-message">
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔔</div>
            <p>No notifications yet</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              When you get notifications, they'll show up here
            </p>
          </div>
        )}
      </div>

      <div className="notifications-dropdown-footer">
        <Link to="/notifications" className="notifications-dropdown-view-all" onClick={onClose}>
          View all notifications
        </Link>
      </div>
    </>
  );
};

// Utility: Human-readable time formatting
function formatTimeAgo(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

export default NotificationDropdownContent;