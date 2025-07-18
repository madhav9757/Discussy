import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import NotificationDropdownContent from './NotificationDropdownContent';
import { useGetNotificationsQuery } from '../../../app/api/notificationsApi.js';
import './NotificationDropdown.css';
import { Bell } from 'lucide-react';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false); 
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); 

  const { data: notifications = [], isLoading, error } = useGetNotificationsQuery();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile(); 
    window.addEventListener('resize', checkIsMobile); 

    return () => {
      window.removeEventListener('resize', checkIsMobile); 
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (!isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile]); 

  const handleButtonClick = () => {
    if (isMobile) {
      navigate('/notifications'); 
      setIsOpen(false); 
    } else {
      setIsOpen(!isOpen); 
    }
  };

  return (
    <div className="notification-dropdown-wrapper" ref={dropdownRef}>
      <button
        className="icon-button notification-button"
        onClick={handleButtonClick} // Use the new handler
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`You have ${unreadCount} new notifications`}
      >
        < Bell className='bell-icon' size={25}  />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {!isMobile && isOpen && (
        <div className="notifications-dropdown-menu">
          <NotificationDropdownContent onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;