import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCircle, LogIn, LogOut } from 'lucide-react';
import './Header.css';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice.js';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { userInfo: user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login')
    };

    return (
        <header className="nav-header">
            <div className="nav-container">
                <Link to="/" className="nav-logo">Discussly</Link>

                <nav className="nav-links">
                    <NavLink to="/" className="nav-link">Home</NavLink>
                    <NavLink to="/explore" className="nav-link">Explore</NavLink>
                    <NavLink to="/about" className="nav-link">About</NavLink>
                </nav>

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
                                onClick={() => navigate('/profile')}
                                style={{ cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px' }}
                            />
                            <span className="user-name">{user.username}</span>
                            <button onClick={handleLogout} className="btn logout-btn">
                                <LogOut size={16} />
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
