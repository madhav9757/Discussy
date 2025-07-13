import React, { useState } from 'react';
import './LoginPage.css';
import { motion } from 'framer-motion';
import { LogIn, Lock, Sun, Moon } from 'lucide-react'; // Import Sun and Moon icons
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../authSlice'; // Assuming this path is correct
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation
// import { unwrapResult } from '@reduxjs/toolkit'; // unwrapResult is not needed here as unwrap() is used directly


const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.auth); // Error state handled in catch block

    const { theme, toggleTheme } = useTheme(); // Use the theme hook

    const [formData, setFormData] = useState({
        usernameOrEmail: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false); // For password visibility toggle
    const [passwordStrength, setPasswordStrength] = useState(0); // 0-3 for strength indicator

    const validateEmailOrUsername = (value) => {
        if (!value) return 'Username or email is required.';
        return '';
    };

    const validatePassword = (pwd) => {
        if (!pwd) return 'Password is required.';
        if (pwd.length < 6) return 'Password must be at least 6 characters.';
        return '';
    };

    const checkPasswordStrength = (pwd) => {
        let strength = 0;
        if (pwd.length >= 6) strength++;
        if (/[A-Z]/.test(pwd)) strength++; // Uppercase
        if (/[a-z]/.test(pwd)) strength++; // Lowercase
        if (/[0-9]/.test(pwd)) strength++; // Number
        if (/[^A-Za-z0-9]/.test(pwd)) strength++; // Special character
        return Math.min(strength, 3); // Cap at 3 for visual bars
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Real-time validation feedback
        if (name === 'usernameOrEmail') {
            setErrors((prev) => ({ ...prev, usernameOrEmail: validateEmailOrUsername(value) }));
        } else if (name === 'password') {
            setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        const usernameEmailErr = validateEmailOrUsername(formData.usernameOrEmail);
        const passwordErr = validatePassword(formData.password);

        if (usernameEmailErr) newErrors.usernameOrEmail = usernameEmailErr;
        if (passwordErr) newErrors.password = passwordErr;
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error("Please correct the form errors.");
            return;
        }

        try {
            // The loginUser async thunk will handle API calls and state updates
            const res = await dispatch(loginUser(formData)).unwrap();
            toast.success('🎉 Login successful!');
            navigate('/');
        } catch (err) {
            // Error from thunk is already 'unwrapped' and is the error object or message
            const errorMessage = err?.data?.message || err?.message || '❌ Login failed';
            toast.error(errorMessage);
        }
    };

    const isFormValid = !errors.usernameOrEmail && !errors.password && formData.usernameOrEmail && formData.password;

    return (
        <div className="login-container">
            {/* Theme Toggle Button */}
            <button
                className="theme-toggle-button"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="login-box"
            >
                <h2 className="login-title">
                    <LogIn size={28} />
                    Login to Discussly
                </h2>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className={`input-group ${errors.usernameOrEmail ? 'has-error' : formData.usernameOrEmail ? 'has-success' : ''}`}>
                        <label htmlFor="usernameOrEmail">Email or Username</label>
                        <div className="input-icon">
                            <input
                                type="text"
                                id="usernameOrEmail"
                                name="usernameOrEmail"
                                value={formData.usernameOrEmail}
                                onChange={handleChange}
                                placeholder="your@example.com or username"
                                autoComplete="username"
                                required
                            />
                            <LogIn size={18} /> {/* Using LogIn icon for username/email field */}
                        </div>
                        {errors.usernameOrEmail && <p className="error-text">{errors.usernameOrEmail}</p>}
                    </div>

                    <div className={`input-group ${errors.password ? 'has-error' : formData.password ? 'has-success' : ''}`}>
                        <label htmlFor="password">Password</label>
                        <div className="input-icon">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                            />
                            {/* Toggle password visibility icon */}
                            {showPassword ? (
                                <Lock size={18} onClick={() => setShowPassword(false)} style={{ cursor: 'pointer' }} />
                            ) : (
                                <Lock size={18} onClick={() => setShowPassword(true)} style={{ cursor: 'pointer' }} />
                                // You might want FaEye and FaEyeSlash from react-icons/fa if you prefer that visual
                            )}
                        </div>
                        {errors.password && <p className="error-text">{errors.password}</p>}
                        {/* Password Strength Indicator */}
                        {formData.password.length > 0 && !errors.password && (
                            <div className="password-strength">
                                <div className={`strength-bar ${passwordStrength >= 1 ? 'weak' : ''}`}></div>
                                <div className={`strength-bar ${passwordStrength >= 2 ? 'medium' : ''}`}></div>
                                <div className={`strength-bar ${passwordStrength >= 3 ? 'strong' : ''}`}></div>
                            </div>
                        )}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        className={`login-btn ${isLoading ? 'login-btn-loading' : ''}`}
                        disabled={isLoading || !isFormValid}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </motion.button>
                </form>

                <p className="login-footer">
                    Don’t have an account?{' '}
                    <Link to="/register" className="register-link">Register</Link>
                </p>
                <p className="login-footer forgot-password-link"> {/* Added class for specific styling */}
                    <Link to="/forgot-password" className="register-link">Forgot Password?</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;