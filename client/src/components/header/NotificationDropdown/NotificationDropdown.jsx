// src/components/NotificationDropdown/NotificationDropdown.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import NotificationDropdownContent from './NotificationDropdownContent';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Get unread notification count from Redux
  const notifications = useSelector((state) => state.notifications.items);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ✅ Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="notification-dropdown-wrapper" ref={dropdownRef}>
      <button
        className="icon-button notification-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`You have ${unreadCount} new notifications`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24" height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
        </svg>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notifications-dropdown-menu">
          <NotificationDropdownContent onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
