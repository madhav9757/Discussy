import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

import {
    MessageCircle, Search, Plus, Bell, UserCircle, Star, Heart,
    LogIn, LogOut, Home, Compass, Info, Sun, Moon, Settings, X,
    LayoutDashboard, FileText, Bookmark, Shield, BarChart3,
    Flag, TrendingUp, Link as LinkIcon, User, Tag, Edit, Clock, Filter,
    ChevronDown,
} from 'lucide-react';
import { logoutUser } from '../../features/auth/authSlice';
import './Header.css';
import { useSelector, useDispatch } from 'react-redux';
import NotificationDropdown from './NotificationDropdown/NotificationDropdown';

const Header = ({ searchQuery, onSearchChange }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // Local states
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    // REMOVED: const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const userDropdownRef = useRef(null);
    // REMOVED: const notificationDropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const mobileMenuToggleButtonRef = useRef(null);
    const searchInputRef = useRef(null);

    const user = useSelector(state => state.auth.userInfo);

    // REMOVED: Simulate unread notifications count
    // const unreadNotificationsCount = 3;

    // Scroll state for header shadow/blur
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Update theme attribute on HTML element and localStorage
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    // Close overlays/dropdowns on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserDropdownOpen(false);
        // REMOVED: setIsNotificationDropdownOpen(false);
        setIsSearchExpanded(false);
    }, [location.pathname]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
            // REMOVED: notificationDropdownRef logic
            // if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
            //     setIsNotificationDropdownOpen(false);
            // }
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target) &&
                mobileMenuToggleButtonRef.current &&
                !mobileMenuToggleButtonRef.current.contains(event.target)
            ) {
                setIsMobileMenuOpen(false);
            }
            if (isSearchExpanded && searchInputRef.current && !searchInputRef.current.closest('.header-search').contains(event.target)) {
                setIsSearchExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSearchExpanded]);

    // Prevent background scroll when mobile menu or search overlay is open
    useEffect(() => {
        document.body.style.overflow = (isMobileMenuOpen || (isSearchExpanded && window.innerWidth < 768)) ? 'hidden' : '';
        return () => (document.body.style.overflow = '');
    }, [isMobileMenuOpen, isSearchExpanded]);

    // Focus search input when it expands
    useEffect(() => {
        if (isSearchExpanded && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchExpanded]);

    // Helper to determine active navigation link
    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        dispatch(logoutUser());
        setIsUserDropdownOpen(false);
        setIsMobileMenuOpen(false);
        navigate('/login');
    };

    // Framer Motion variants for mobile menu items (used within the menu panel)
    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1 }
    };

    // Framer Motion variants for mobile menu container (stagger effect)
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.07,
                delayChildren: 0.2
            }
        }
    };

    // Helper function to get the Lucide icon component by name
    const getIconComponent = (iconName) => {
        const icons = {
            Home, Compass, Info, LayoutDashboard, FileText, Bookmark,
            Shield, BarChart3, Flag, TrendingUp, Link: LinkIcon, User, Tag, Edit,
            Star, Heart, MessageCircle, Clock, Settings, LogIn, LogOut, Plus, Bell, UserCircle, Sun, Moon, Search, X
        };
        return icons[iconName] || Home;
    };

    const navItems = [
        { label: 'Home', path: '/', icon: 'Home' },
        { label: 'Explore', path: '/explore', icon: 'Compass' },
        { label: 'About', path: '/about', icon: 'Info' },
    ];

    if (user) {
        navItems.push({ label: 'Profile', path: '/profile', icon: 'UserCircle' });
    }

    // Dynamic Search Suggestions
    const allSuggestions = ['AI Ethics', 'React Hooks', 'Frontend Frameworks 2025', 'Web Development Trends', 'User Profile Design', 'Latest News', 'GraphQL vs REST'];

    const filteredSuggestions = searchQuery
        ? allSuggestions.filter(s =>
            s.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : ['Latest News', 'User Profile Design', 'AI Ethics', 'Frontend Frameworks 2025'];

    return (
        <header className={clsx('header-main', {
            'scrolled': isScrolled,
            'search-active': isSearchExpanded && window.innerWidth < 768
        })}>
            <div className="header-container">
                {/* Logo */}
                <Link to="/" className="header-logo-section"
                    onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsUserDropdownOpen(false);
                        // REMOVED: setIsNotificationDropdownOpen(false);
                        setIsSearchExpanded(false);
                    }}
                >
                    <MessageCircle className="header-logo-icon" />
                    <span className="header-logo-text">Discussly</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="header-nav">
                    {navItems.map(item => {
                        const IconComponent = getIconComponent(item.icon);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx('header-nav-link', { 'active': isActive(item.path) })}
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setIsUserDropdownOpen(false);
                                    // REMOVED: setIsNotificationDropdownOpen(false);
                                    setIsSearchExpanded(false);
                                }}
                            >
                                <IconComponent size={16} className="header-icon" />
                                <span>{item.label}</span>
                                {isActive(item.path) && (
                                    <motion.div
                                        className="nav-indicator"
                                        layoutId="nav-indicator"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Smart Search - Desktop & Mobile (integrated for a consistent look) */}
                <div className={clsx('header-search', {
                    'header-search--expanded': isSearchExpanded && window.innerWidth < 768
                })}>
                    <div className="header-search-input-wrapper">
                        <Search className="header-search-icon" />
                        <input
                            type="text"
                            placeholder="Search discussions..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onFocus={() => setIsSearchExpanded(true)}
                            ref={searchInputRef}
                            aria-label="Search"
                        />
                        {/* Clear button if search is active */}
                        {isSearchExpanded && searchQuery.length > 0 && (
                            <motion.button
                                className="search-clear-button"
                                onClick={() => onSearchChange('')}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                aria-label="Clear search"
                            >
                                <X size={18} />
                            </motion.button>
                        )}
                        <span className="header-search-shortcut">⌘K</span>
                    </div>
                    {/* Search Suggestions/Recent (Populated dynamically) */}
                    <AnimatePresence>
                        {isSearchExpanded && (
                            <motion.div
                                className="header-dropdown search-dropdown"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {filteredSuggestions.length > 0 ? (
                                    <div className="dropdown-section">
                                        <h4>{searchQuery ? 'Search Results' : 'Suggestions'}</h4>
                                        <ul>
                                            {filteredSuggestions.map((item) => (
                                                <li key={item} onClick={() => {
                                                    onSearchChange(item);
                                                    setIsSearchExpanded(false);
                                                }}>
                                                    <Search size={16} className="header-icon" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="dropdown-section no-results">
                                        <p>No results found for "{searchQuery}".</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Desktop Actions */}
                <div className="header-actions">
                    {/* Notifications Bell (handled by NotificationDropdown component) */}
                    <NotificationDropdown />

                    {/* New Post Button */}
                    <Link to="/new-post" className="new-post-button" aria-label="Create New Post">
                        <Plus size={20} className="header-icon" /> <span className="hide-on-small">New Post</span>
                    </Link>

                    {/* Theme Toggle (Desktop) */}
                    <motion.button
                        className="action-button theme-toggle-desktop"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {isDarkMode ? <Sun size={20} className="header-icon" /> : <Moon size={20} className="header-icon" />}
                    </motion.button>

                    {/* User Profile / Login / Register */}
                    {!user ? (
                        <div className="header-auth-buttons">
                            <Link to="/login" className="auth-link">
                                <LogIn size={16} className="header-icon" />
                                <span>Login</span>
                            </Link>
                            <Link to="/register" className="auth-register-button">
                                <UserCircle size={16} className="header-icon" />
                                <span>Sign Up</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="action-button-wrapper" ref={userDropdownRef}>
                            <motion.button
                                className={clsx('action-button user-toggle', {
                                    'active': isUserDropdownOpen,
                                })}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                aria-label={`User options for ${user.username}`}
                                aria-expanded={isUserDropdownOpen}
                                aria-controls="user-dropdown-menu"
                            >
                                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} alt={`${user.username}'s avatar`} className="header-avatar" />
                                <span className="header-username">{user.username}</span>
                                <ChevronDown
                                    size={16}
                                    className={clsx('header-chevron', {
                                        'header-chevron--open': isUserDropdownOpen,
                                    })}
                                />
                            </motion.button>

                            <AnimatePresence>
                                {isUserDropdownOpen && (
                                    <motion.div
                                        id="user-dropdown-menu"
                                        className="header-dropdown user-dropdown"
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="user-dropdown-header">
                                            <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} alt={user.username} className="header-avatar" />
                                            <div>
                                                <p className="user-dropdown-name">{user.username}</p>
                                                <p className="user-dropdown-email">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="dropdown-section">
                                            <Link to="/profile" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                                                <UserCircle size={16} className="header-icon" /> My Profile
                                            </Link>
                                            <Link to="/settings" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                                                <Settings size={16} className="header-icon" /> Settings
                                            </Link>
                                            {user.role === 'admin' && (
                                                <Link to="/admin" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                                                    <Shield size={16} className="header-icon" /> Admin Panel
                                                </Link>
                                            )}
                                        </div>

                                        <div className="dropdown-section">
                                            <button
                                                className="dropdown-item dropdown-item--danger"
                                                onClick={handleLogout}
                                            >
                                                <LogOut size={16} className="header-icon" /> Logout
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Mobile Toggles (Search, Notifications, Menu) */}
                <div className="header-mobile-toggles">
                    {/* Mobile Search Button (toggles the full-width search overlay) */}
                    <motion.button
                        className="action-button mobile-search-button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                        aria-label="Toggle search"
                    >
                        <Search size={20} className="header-icon" />
                    </motion.button>

                    {/* Mobile Notification Bell (handled by NotificationDropdown component) */}
                    <div className="mobile-notification-toggle">
                        <NotificationDropdown />
                    </div>

                    {/* Hamburger Menu Toggle */}
                    <button
                        ref={mobileMenuToggleButtonRef}
                        className={clsx('mobile-menu-button', {
                            'open': isMobileMenuOpen,
                        })}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-sidebar-menu"
                    >
                        <span className="mobile-menu-button-line"></span>
                        <span className="mobile-menu-button-line"></span>
                        <span className="mobile-menu-button-line"></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        id="mobile-sidebar-menu"
                        ref={mobileMenuRef}
                        className="mobile-menu-sidebar"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <motion.nav
                            className="mobile-nav-list"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {navItems.map(item => {
                                const IconComponent = getIconComponent(item.icon);
                                return (
                                    <motion.div key={item.path} variants={itemVariants}>
                                        <Link
                                            to={item.path}
                                            className={clsx('mobile-nav-link', { 'active': isActive(item.path) })}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <IconComponent size={20} className="header-icon" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                            {user && (
                                <motion.div variants={itemVariants}>
                                    <Link to="/new-post" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Plus size={20} className="header-icon" /> New Post
                                    </Link>
                                </motion.div>
                            )}

                        </motion.nav>

                        <div className="mobile-menu-footer">
                            <motion.div variants={itemVariants} className="theme-toggle-mobile-wrapper">
                                <span className="theme-toggle-label">Dark Mode</span>
                                <motion.button
                                    className="action-button theme-toggle-mobile"
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                                >
                                    {isDarkMode ? <Sun size={40} className="header-icon" /> : <Moon size={40} className="header-icon" />}
                                </motion.button>
                            </motion.div>

                            {!user ? (
                                <motion.div variants={itemVariants} className="mobile-auth-buttons">
                                    <Link to="/login" className="mobile-auth-link" onClick={() => setIsMobileMenuOpen(false)}>
                                        <LogIn size={20} className="header-icon" /> Login
                                    </Link>
                                    <Link to="/register" className="mobile-auth-register-button" onClick={() => setIsMobileMenuOpen(false)}>
                                        <UserCircle size={20} className="header-icon" /> Sign Up
                                    </Link>
                                </motion.div>
                            ) : (
                                <motion.div variants={itemVariants} className="mobile-logout-button-wrapper">
                                    <button
                                        className="mobile-logout-button dropdown-item--danger"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={20} className="header-icon" /> Logout
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;