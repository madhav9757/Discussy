import React, { useState } from 'react'; // Import useState
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCircle, LogIn, LogOut, Home, Compass, Info } from 'lucide-react'; // Import icons for mobile nav
import './Header.css';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice.js';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { userInfo: user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
        setIsMobileMenuOpen(false); // Close mobile menu on logout
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false); // Function to close the mobile menu
    };

    return (
        <header className="nav-header">
            <div className="nav-container">
                <Link to="/" className="nav-logo">Discussly</Link>

                {/* Desktop Navigation Links */}
                <nav className="nav-links">
                    <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
                    <NavLink to="/explore" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Explore</NavLink>
                    <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>About</NavLink>
                    {/* Add Profile link for logged-in users on desktop */}
                    {user && <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Profile</NavLink>}
                </nav>

                {/* Desktop Auth Buttons / User Box */}
                <div className="nav-auth">
                    {!user ? (
                        <>
                            <Link to="/login" className="btn login-btn">
                                <LogIn size={18} /> Login
                            </Link>
                            <Link to="/register" className="btn register-btn">
                                <UserCircle size={18} /> Register
                            </Link>
                        </>
                    ) : (
                        <motion.div whileHover={{ scale: 1.02 }} className="user-box">
                            <img
                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`}
                                alt="avatar"
                                className="user-avatar"
                                onClick={() => navigate(`/profile`)} // Navigate to profile on avatar click
                            />
                            <span className="user-name">{user.username}</span>
                            <button onClick={handleLogout} className="btn logout-btn">
                                <LogOut size={16} />
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Mobile Hamburger Menu Icon */}
                <div
                    className={`hamburger-menu ${isMobileMenuOpen ? 'open' : ''}`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle mobile menu"
                >
                    <div className="hamburger-bar"></div>
                    <div className="hamburger-bar"></div>
                    <div className="hamburger-bar"></div>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
                <nav className="mobile-nav-content">
                    <NavLink to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
                        <Home size={20} /> Home
                    </NavLink>
                    <NavLink to="/explore" className="mobile-nav-link" onClick={closeMobileMenu}>
                        <Compass size={20} /> Explore
                    </NavLink>
                    <NavLink to="/about" className="mobile-nav-link" onClick={closeMobileMenu}>
                        <Info size={20} /> About
                    </NavLink>
                    {user && (
                        <NavLink to="/profile" className="mobile-nav-link" onClick={closeMobileMenu}>
                            <UserCircle size={20} /> Profile
                        </NavLink>
                    )}

                    {/* Mobile Auth Buttons (shown inside overlay) */}
                    <div className="mobile-auth-buttons">
                        {!user ? (
                            <>
                                <Link to="/login" className="btn login-btn" onClick={closeMobileMenu}>
                                    <LogIn size={20} /> Login
                                </Link>
                                <Link to="/register" className="btn register-btn" onClick={closeMobileMenu}>
                                    <UserCircle size={20} /> Register
                                </Link>
                            </>
                        ) : (
                            <button onClick={handleLogout} className="btn logout-btn mobile-logout-btn">
                                <LogOut size={20} /> Logout
                            </button>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;