import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  MessageCircle, Search, Plus, Bell, UserCircle, LogIn, LogOut,
  Home, Compass, Info, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Header.css';

const Header = ({ searchQuery, onSearchChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { userInfo: user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    // Replace with actual logout dispatch
    console.log('Logout clicked');
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Scroll lock when menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
    return () => (document.body.style.overflow = 'auto');
  }, [isMobileMenuOpen]);

  return (
    <header className="nav-header">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo-section">
          <MessageCircle className="logo-icon-svg" />
          <Link to="/" className="nav-logo">Discussly</Link>
        </div>

        {/* Desktop Nav */}
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/explore" className="nav-link">Explore</Link>
          <Link to="/about" className="nav-link">About</Link>
          {user && <Link to="/profile" className="nav-link">Profile</Link>}
        </nav>

        {/* Desktop Search */}
        <div className="desktop-search">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Desktop Auth */}
        <div className="nav-auth">
          <button className="icon-btn notification-btn">
            <Bell className="icon" />
            <span className="notification-badge">3</span>
          </button>

          <button className="btn new-discussion-btn">
            <Plus className="btn-icon" />
            <span className="btn-text">New Discussion</span>
          </button>

          {!user ? (
            <div className="auth-buttons">
              <Link to="/login" className="btn login-btn">
                <LogIn className="btn-icon" /> Login
              </Link>
              <Link to="/register" className="btn register-btn">
                <UserCircle className="btn-icon" /> Register
              </Link>
            </div>
          ) : (
            <div className="user-box">
              <img
                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`}
                alt="avatar"
                className="user-avatar"
              />
              <span className="user-name">{user.username}</span>
              <button onClick={handleLogout} className="btn logout-btn">
                <LogOut className="btn-icon" />
              </button>
            </div>
          )}
        </div>

        {/* Hamburger Menu */}
        <button
          className={`hamburger-menu ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <div className="hamburger-bar"></div>
          <div className="hamburger-bar"></div>
          <div className="hamburger-bar"></div>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="mobile-nav-overlay"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 250, damping: 30 }}
            >
              <div className="mobile-nav-header">
                <div className="mobile-logo">
                  <MessageCircle className="mobile-logo-icon" />
                  <span>Discussly</span>
                </div>
                <button className="close-btn" onClick={closeMobileMenu}>
                  <X className="close-icon" />
                </button>
              </div>

              <div className="mobile-search">
                <div className="search-container">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <nav className="mobile-nav-content">
                <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
                  <Home className="mobile-nav-icon" /> Home
                </Link>
                <Link to="/explore" className="mobile-nav-link" onClick={closeMobileMenu}>
                  <Compass className="mobile-nav-icon" /> Explore
                </Link>
                <Link to="/about" className="mobile-nav-link" onClick={closeMobileMenu}>
                  <Info className="mobile-nav-icon" /> About
                </Link>
                {user && (
                  <Link to="/profile" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <UserCircle className="mobile-nav-icon" /> Profile
                  </Link>
                )}

                <div className="mobile-nav-divider" />

                <button className="mobile-nav-link new-discussion-mobile">
                  <Plus className="mobile-nav-icon" /> New Discussion
                </button>

                <button className="mobile-nav-link notifications-mobile">
                  <Bell className="mobile-nav-icon" /> Notifications
                  <span className="mobile-notification-badge">3</span>
                </button>

                <div className="mobile-auth-buttons">
                  {!user ? (
                    <>
                      <Link to="/login" className="btn login-btn mobile-auth-btn" onClick={closeMobileMenu}>
                        <LogIn className="btn-icon" /> Login
                      </Link>
                      <Link to="/register" className="btn register-btn mobile-auth-btn" onClick={closeMobileMenu}>
                        <UserCircle className="btn-icon" /> Register
                      </Link>
                    </>
                  ) : (
                    <button onClick={handleLogout} className="btn logout-btn mobile-logout-btn">
                      <LogOut className="btn-icon" /> Logout
                    </button>
                  )}
                </div>
              </nav>
            </motion.div>

            {/* Optional dark background overlay */}
            <motion.div
              className="mobile-overlay-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
            />
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
