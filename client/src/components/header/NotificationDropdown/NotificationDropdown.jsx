// src/components/NotificationDropdown/NotificationDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import NotificationDropdownContent from './NotificationDropdownContent'; // Import the content component
import './NotificationDropdown.css'; // Import the new CSS file for the dropdown

const NotificationDropdown = ({ notificationCount = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null); // Ref for the entire dropdown area (button + content)

    // Function to close the dropdown
    const closeDropdown = () => {
        setIsOpen(false);
    };

    // Effect to handle clicks outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If the dropdown is open and the click is outside the dropdown area, close it
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                closeDropdown();
            }
        };

        // Add event listener when the component mounts
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up the event listener when the component unmounts
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

    return (
        <div className="notification-dropdown-wrapper" ref={dropdownRef}>
            {/* Notification Icon Button - This will toggle the dropdown */}
            <button
                className="icon-button notification-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="true" // Indicates a popup is associated
                aria-expanded={isOpen} // Indicates whether the popup is currently expanded
                aria-label={`You have ${notificationCount} new notifications`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
            </button>

            {/* Notification Dropdown Content - Conditionally rendered */}
            {isOpen && (
                <div className="notifications-dropdown-menu">
                    <NotificationDropdownContent onClose={closeDropdown} />
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;