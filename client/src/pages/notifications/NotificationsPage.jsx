import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Info, UserPlus, FileText, Trash2 } from 'lucide-react';
import { 
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation 
} from '../../app/api/notificationsApi.js';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { data: notifications = [], isLoading, error } = useGetNotificationsQuery();
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllRead, { isLoading: isMarkingAllRead }] = useMarkAllNotificationsAsReadMutation();

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'comment':
        return <MessageCircle size={20} />;
      case 'like':
        return <Heart size={20} />;
      case 'follow':
        return <UserPlus size={20} />;
      case 'post':
        return <FileText size={20} />;
      case 'system':
      default:
        return <Info size={20} />;
    }
  };

  const getNotificationTypeClass = (type) => {
    switch (type) {
      case 'comment':
        return 'notification-type-comment';
      case 'like':
        return 'notification-type-like';
      case 'follow':
        return 'notification-type-follow';
      case 'post':
        return 'notification-type-post';
      case 'system':
      default:
        return 'notification-type-system';
    }
  };

  if (isLoading) {
    return (
      <div className="notifications-page">
        <div className="notifications-loading">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-page">
        <div className="notifications-error">Failed to load notifications</div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <button 
            className="mark-all-read-btn"
            onClick={handleMarkAllRead}
            disabled={isMarkingAllRead}
          >
            {isMarkingAllRead ? 'Marking all read...' : `Mark all read (${unreadCount})`}
          </button>
        )}
      </div>

      <div className="notifications-container">
        {notifications.length > 0 ? (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
              >
                <div className="notification-content">
                  <div className={`notification-icon ${getNotificationTypeClass(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="notification-body">
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {formatTimeAgo(notification.createdAt)}
                    </div>
                  </div>

                  {!notification.isRead && (
                    <div className="notification-unread-indicator" />
                  )}
                </div>

                {notification.link && (
                  <Link 
                    to={notification.link} 
                    className="notification-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="notifications-empty">
            <div className="empty-icon">🔔</div>
            <h3>No notifications yet</h3>
            <p>When you get notifications, they'll show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Utility function for time formatting
function formatTimeAgo(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hrs ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
}

export default NotificationsPage;