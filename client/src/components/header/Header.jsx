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
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { userInfo: user } = useSelector((state) => state.auth);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={`nav-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo */}
        <motion.div 
          className="nav-logo-section"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <MessageCircle className="logo-icon-svg" />
          </motion.div>
          <Link to="/" className="nav-logo">Discussly</Link>
        </motion.div>

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
              value={searchQuery || ''}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Desktop Auth */}
        <div className="nav-auth">
          <motion.button 
            className="icon-btn notification-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="icon" />
            <span className="notification-badge">3</span>
          </motion.button>

          <motion.button 
            className="btn new-discussion-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="btn-icon" />
            <span className="btn-text">New Discussion</span>
          </motion.button>

          {!user ? (
            <div className="auth-buttons">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className="btn login-btn">
                  <LogIn className="btn-icon" /> 
                  <span className="btn-text">Login</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="btn register-btn">
                  <UserCircle className="btn-icon" /> 
                  <span className="btn-text">Register</span>
                </Link>
              </motion.div>
            </div>
          ) : (
            <motion.div 
              className="user-box"
              whileHover={{ scale: 1.02 }}
            >
              <motion.img
                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`}
                alt="avatar"
                className="user-avatar"
                whileHover={{ scale: 1.1 }}
              />
              <span className="user-name">{user.username}</span>
              <motion.button 
                onClick={handleLogout} 
                className="btn logout-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="btn-icon" />
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Hamburger Menu */}
        <motion.button
          className={`hamburger-menu ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="hamburger-bar"></div>
          <div className="hamburger-bar"></div>
          <div className="hamburger-bar"></div>
        </motion.button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="mobile-nav-overlay open"
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
                <motion.button 
                  className="close-btn" 
                  onClick={closeMobileMenu}
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="close-icon" />
                </motion.button>
              </div>

              <div className="mobile-search">
                <div className="search-container">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search discussions..."
                    value={searchQuery || ''}
                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <nav className="mobile-nav-content">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <Home className="mobile-nav-icon" /> Home
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Link to="/explore" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <Compass className="mobile-nav-icon" /> Explore
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link to="/about" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <Info className="mobile-nav-icon" /> About
                  </Link>
                </motion.div>
                
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Link to="/profile" className="mobile-nav-link" onClick={closeMobileMenu}>
                      <UserCircle className="mobile-nav-icon" /> Profile
                    </Link>
                  </motion.div>
                )}

                <div className="mobile-nav-divider" />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <button className="mobile-nav-link new-discussion-mobile">
                    <Plus className="mobile-nav-icon" /> New Discussion
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <button className="mobile-nav-link notifications-mobile">
                    <Bell className="mobile-nav-icon" /> Notifications
                    <span className="mobile-notification-badge">3</span>
                  </button>
                </motion.div>

                <div className="mobile-auth-buttons">
                  {!user ? (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Link to="/login" className="btn login-btn mobile-auth-btn" onClick={closeMobileMenu}>
                          <LogIn className="btn-icon" /> Login
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                      >
                        <Link to="/register" className="btn register-btn mobile-auth-btn" onClick={closeMobileMenu}>
                          <UserCircle className="btn-icon" /> Register
                        </Link>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <button onClick={handleLogout} className="btn logout-btn mobile-logout-btn">
                        <LogOut className="btn-icon" /> Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              </nav>
            </motion.div>

            {/* Dark background overlay */}
            <motion.div
              className="mobile-overlay-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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