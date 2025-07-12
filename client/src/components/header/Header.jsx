import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MessageCircle,
  Search,
  Plus,
  Bell,
  UserCircle,
  LogIn,
  LogOut,
  Home,
  Compass,
  Info,
  Sun,
  Moon,
  X
} from 'lucide-react';
import './Header.css';

const Header = ({ searchQuery, onSearchChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize dark mode from local storage or system preference
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Mock user state - replace with your actual auth logic
  // For demonstration, let's simulate a logged-in user
  const user = { username: 'john_doe' }; // Change to null to see logged-out state

  const handleLogout = () => {
    // Replace with your actual logout logic
    console.log('User logged out');
    // For demo, we'll just set user to null, in a real app, clear token/session
    // setUser(null);
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20); // More noticeable scroll effect
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle dark mode and save to local storage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const isActiveRoute = (path) => location.pathname === path;

  return (
    <>
      <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
        <div className="header__container">
          {/* Logo */}
          <Link to="/" className="header__logo" onClick={closeMobileMenu}>
            <MessageCircle className="header__logo-icon" />
            <span className="header__logo-text">Discussly</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="header__nav">
            <Link
              to="/"
              className={`header__nav-link ${isActiveRoute('/') ? 'header__nav-link--active' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className={`header__nav-link ${isActiveRoute('/explore') ? 'header__nav-link--active' : ''}`}
            >
              Explore
            </Link>
            <Link
              to="/about"
              className={`header__nav-link ${isActiveRoute('/about') ? 'header__nav-link--active' : ''}`}
            >
              About
            </Link>
            {user && (
              <Link
                to="/profile"
                className={`header__nav-link ${isActiveRoute('/profile') ? 'header__nav-link--active' : ''}`}
              >
                Profile
              </Link>
            )}
          </nav>

          {/* Search Bar */}
          <div className="header__search">
            <div className="search-input">
              <Search className="search-input__icon" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input__field"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="header__actions">
            <button className="header__action-btn header__action-btn--notification" aria-label="Notifications">
              <Bell className="header__action-icon" />
              <span className="notification-badge">3</span>
            </button>

            <Link to="/new-post" className="header__action-btn header__action-btn--primary">
              <Plus className="header__action-icon" />
              <span className="header__action-text">New Post</span>
            </Link>

            <button
              className="header__action-btn header__action-btn--theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="header__action-icon" /> : <Moon className="header__action-icon" />}
            </button>

            {!user ? (
              <div className="header__auth">
                <Link to="/login" className="header__auth-btn header__auth-btn--login">
                  <LogIn className="header__action-icon" />
                  Login
                </Link>
                <Link to="/register" className="header__auth-btn header__auth-btn--register">
                  <UserCircle className="header__action-icon" />
                  Register
                </Link>
              </div>
            ) : (
              <div className="header__user">
                <img
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`}
                  alt={`${user.username}'s avatar`}
                  className="header__user-avatar"
                />
                <span className="header__user-name">{user.username}</span>
                <button onClick={handleLogout} className="header__action-btn header__action-btn--logout" aria-label="Logout">
                  <LogOut className="header__action-icon" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`header__menu-toggle ${isMobileMenuOpen ? 'header__menu-toggle--active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span className="header__menu-toggle-line"></span>
            <span className="header__menu-toggle-line"></span>
            <span className="header__menu-toggle-line"></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu--open' : ''}`}>
          <div className="mobile-menu__overlay" onClick={closeMobileMenu} aria-hidden="true"></div>

          <div className="mobile-menu__content">
            <div className="mobile-menu__header">
              <Link to="/" className="mobile-menu__logo" onClick={closeMobileMenu}>
                <MessageCircle className="mobile-menu__logo-icon" />
                <span>Discussly</span>
              </Link>
              <button className="mobile-menu__close" onClick={closeMobileMenu} aria-label="Close mobile menu">
                <X size={24} />
              </button>
            </div>

            <div className="mobile-menu__search">
              <div className="search-input">
                <Search className="search-input__icon" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="search-input__field"
                />
              </div>
            </div>

            <nav className="mobile-menu__nav">
              <Link to="/" className="mobile-menu__nav-link" onClick={closeMobileMenu}>
                <Home className="mobile-menu__nav-icon" />
                Home
              </Link>
              <Link to="/explore" className="mobile-menu__nav-link" onClick={closeMobileMenu}>
                <Compass className="mobile-menu__nav-icon" />
                Explore
              </Link>
              <Link to="/about" className="mobile-menu__nav-link" onClick={closeMobileMenu}>
                <Info className="mobile-menu__nav-icon" />
                About
              </Link>
              {user && (
                <Link to="/profile" className="mobile-menu__nav-link" onClick={closeMobileMenu}>
                  <UserCircle className="mobile-menu__nav-icon" />
                  Profile
                </Link>
              )}
            </nav>

            <div className="mobile-menu__actions">
              <Link to="/new-post" className="mobile-menu__action-btn" onClick={closeMobileMenu}>
                <Plus className="mobile-menu__action-icon" />
                New Post
              </Link>

              <button className="mobile-menu__action-btn">
                <Bell className="mobile-menu__action-icon" />
                Notifications
                <span className="notification-badge">3</span>
              </button>

              <button
                className="mobile-menu__action-btn"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="mobile-menu__action-icon" /> : <Moon className="mobile-menu__action-icon" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>

            <div className="mobile-menu__auth">
              {!user ? (
                <>
                  <Link to="/login" className="mobile-menu__auth-btn mobile-menu__auth-btn--login" onClick={closeMobileMenu}>
                    <LogIn />
                    Login
                  </Link>
                  <Link to="/register" className="mobile-menu__auth-btn mobile-menu__auth-btn--register" onClick={closeMobileMenu}>
                    <UserCircle />
                    Register
                  </Link>
                </>
              ) : (
                <button onClick={handleLogout} className="mobile-menu__auth-btn mobile-menu__auth-btn--logout">
                  <LogOut />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;