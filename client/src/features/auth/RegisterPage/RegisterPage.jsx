import React, { useState } from 'react';
import './RegisterPage.css';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, loginUser } from '../authSlice';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';

const RegisterPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading } = useSelector((state) => state.auth);

    const { theme, toggleTheme } = useTheme();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0); // 0-6 for 6 strength bars

    // Validation functions
    const validateUsername = (value) => {
        if (!value) return 'Username is required.';
        if (value.length < 3) return 'Username must be at least 3 characters.';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores.';
        return '';
    };

    const validateEmail = (value) => {
        if (!value) return 'Email is required.';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email address is invalid.';
        return '';
    };

    const validatePassword = (pwd) => {
        // Changed minimum length from 8 to 6 characters
        if (!pwd) return 'Password is required.';
        if (pwd.length < 6) return 'Password must be at least 6 characters.';
        if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter.';
        if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter.';
        if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number.';
        if (!/[^A-Za-z0-9]/.test(pwd)) return 'Password must contain at least one special character.';
        return '';
    };

    // Function to check password strength (0-6 levels)
    const checkPasswordStrength = (pwd) => {
        let strength = 0;
        // Level 1: Length >= 6
        if (pwd.length >= 6) strength++;
        // Level 2: Mix of upper and lower case
        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) strength++;
        // Level 3: Contains numbers
        if (/[0-9]/.test(pwd)) strength++;
        // Level 4: Contains special characters
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;
        // Level 5: Length >= 10 (enhanced length)
        if (pwd.length >= 10) strength++;
        // Level 6: Mix of all types and length >= 12 (very strong)
        if (pwd.length >= 12 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) strength++;
        
        return Math.min(strength, 6); // Cap at 6 levels
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'username') {
            setErrors((prev) => ({ ...prev, username: validateUsername(value) }));
        } else if (name === 'email') {
            setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
        } else if (name === 'password') {
            setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        const usernameErr = validateUsername(formData.username);
        const emailErr = validateEmail(formData.email);
        const passwordErr = validatePassword(formData.password);

        if (usernameErr) newErrors.username = usernameErr;
        if (emailErr) newErrors.email = emailErr;
        if (passwordErr) newErrors.password = passwordErr;
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error("Please correct the form errors before submitting.");
            return;
        }

        try {
            await dispatch(registerUser(formData)).unwrap();
            toast.success('🎉 Registration successful!');

            const loginRes = await dispatch(
                loginUser({ usernameOrEmail: formData.email, password: formData.password })
            ).unwrap();

            toast.success('Logged in automatically!');
            navigate('/');
        } catch (err) {
            const errorMessage = err?.data?.message || err?.message || '❌ Registration failed';
            console.error("Registration/Login failed:", err);
            toast.error(errorMessage);
        }
    };

    const isFormValid = !errors.username && !errors.email && !errors.password &&
                        formData.username && formData.email && formData.password;

    return (
        <div className="register-container">
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
                className="register-box"
            >
                <h2 className="register-title">
                    <UserPlus size={28} /> Create Account
                </h2>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className={`input-group ${errors.username ? 'has-error' : formData.username ? 'has-success' : ''}`}>
                        <label htmlFor="username">Username</label>
                        <div className="input-icon">
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="johndoe"
                                autoComplete="username"
                                required
                            />
                            <User size={18} />
                        </div>
                        {errors.username && <p className="error-text">{errors.username}</p>}
                    </div>

                    <div className={`input-group ${errors.email ? 'has-error' : formData.email ? 'has-success' : ''}`}>
                        <label htmlFor="email">Email</label>
                        <div className="input-icon">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />
                            <Mail size={18} />
                        </div>
                        {errors.email && <p className="error-text">{errors.email}</p>}
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
                                autoComplete="new-password"
                                required
                            />
                            {showPassword ? (
                                <EyeOff size={18} onClick={() => setShowPassword(false)} style={{ cursor: 'pointer' }} aria-label="Hide password" />
                            ) : (
                                <Eye size={18} onClick={() => setShowPassword(true)} style={{ cursor: 'pointer' }} aria-label="Show password" />
                            )}
                        </div>
                        {errors.password && <p className="error-text">{errors.password}</p>}
                        {/* Password Strength Indicator with 6 bars */}
                        {formData.password.length > 0 && (
                            <div className="password-strength">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className={`strength-bar level-${index + 1}`}
                                        style={{ opacity: passwordStrength > index ? 1 : 0.2 }}
                                    ></div>
                                ))}
                            </div>
                        )}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        className={`register-btn ${isLoading ? 'register-btn-loading' : ''}`}
                        disabled={isLoading || !isFormValid}
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </motion.button>
                </form>

                <p className="register-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="login-link">Login</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
