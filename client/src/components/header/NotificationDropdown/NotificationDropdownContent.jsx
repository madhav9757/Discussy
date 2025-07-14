import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Info } from 'lucide-react';
import './NotificationDropdown.css'; // Import the new CSS file

const NotificationDropdownContent = ({ onClose }) => (
    <>
        <div className="notifications-dropdown-header">
            <h3>Notifications</h3>
            {/* Conditional "Mark all read" button if there are unread notifications */}
            <button className="notifications-dropdown-mark-all">Mark all read</button>
        </div>
        <div className="notifications-dropdown-list">
            {/* Simulated Notifications - In a real app, this would be mapped from an array of notification objects */}
            <div className="notification-item notification-item--unread">
                <div className="notification-item-avatar">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=reply_user" alt="User avatar" />
                    <div className="notification-item-type notification-item-type--comment">
                        <MessageCircle size={12} className="notification-type-icon" />
                    </div>
                </div>
                <div className="notification-item-content">
                    <p className="notification-item-message">New reply on your post.</p>
                    <span className="notification-item-time">5 mins ago</span>
                </div>
                <div className="notification-item-unread-dot" />
            </div>
            <div className="notification-item">
                <div className="notification-item-avatar">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=john" alt="User avatar" />
                    <div className="notification-item-type notification-item-type--like">
                        <Heart size={12} className="notification-type-icon" />
                    </div>
                </div>
                <div className="notification-item-content">
                    <p className="notification-item-message">John liked your comment.</p>
                    <span className="notification-item-time">1 hour ago</span>
                </div>
            </div>
            <div className="notification-item">
                <div className="notification-item-avatar">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=system" alt="System avatar" />
                    <div className="notification-item-type notification-item-type--system">
                        <Info size={12} className="notification-type-icon" />
                    </div>
                </div>
                <div className="notification-item-content">
                    <p className="notification-item-message">Welcome to Discussly!</p>
                    <span className="notification-item-time">1 day ago</span>
                </div>
            </div>
        </div>
        <div className="notifications-dropdown-footer">
            <Link to="/notifications" className="notifications-dropdown-view-all" onClick={onClose}>
                View all notifications
            </Link>
        </div>
    </>
);

export default NotificationDropdownContent;