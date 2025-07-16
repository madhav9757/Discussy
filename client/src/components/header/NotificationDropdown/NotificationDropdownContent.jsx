// src/components/NotificationDropdown/NotificationDropdownContent.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Info, UserPlus, FileText } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useMarkAllNotificationsAsReadMutation,
} from '../../../app/api/notificationsApi.js';
import { notificationsApi } from '../../../app/api/notificationsApi.js';
import './NotificationDropdown.css';

const NotificationDropdownContent = ({ onClose }) => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => {
    // Get notifications from RTK Query cache
    const notificationsData = notificationsApi.endpoints.getNotifications.select()(state);
    return notificationsData?.data || [];
  });
  
  const [markAllRead, { isLoading }] = useMarkAllNotificationsAsReadMutation();

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap(); // RTK Query mutation
      // The cache will be updated automatically via the socket event
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
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

  return (
    <>
      <div className="notifications-dropdown-header">
        <h3>Notifications</h3>
        {notifications.some(n => !n.isRead) && (
          <button
            className="notifications-dropdown-mark-all"
            onClick={handleMarkAllRead}
            disabled={isLoading}
          >
            {isLoading ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      <div className="notifications-dropdown-list">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <Link
              to={notif.link || '#'}
              key={notif._id}
              className={`notification-item ${!notif.isRead ? 'notification-item--unread' : ''}`}
              onClick={onClose}
            >
              <div className="notification-item-avatar">
                <img
                  src={notif.relatedUser 
                    ? `https://api.dicebear.com/7.x/pixel-art/svg?seed=${notif.relatedUser}` 
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
          <div className="modal-empty-message">No notifications</div>
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
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hrs ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export default NotificationDropdownContent;