import React, { useState } from 'react';
import './LoginPage.css';
import { motion } from 'framer-motion';
import { LogIn, Lock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../authSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { unwrapResult } from '@reduxjs/toolkit';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '', // ✅ not undefined
    password: '',        // ✅ not undefined
  });
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.usernameOrEmail) newErrors.usernameOrEmail = 'Username or email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;
    try {
      const res = await dispatch(loginUser(formData)).unwrap(); // ✅ .unwrap gives actual payload or throws

      toast.success('🎉 Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err?.message || '❌ Login failed');
    }
  };

  return (
    <div className="login-container">
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
          <label>Email or Username</label>
          <div className="input-icon">
            <input
              type="text"
              name="usernameOrEmail"
              value={formData.usernameOrEmail || ''}
              onChange={handleChange}
              placeholder="Email or Username"
            />
          </div>
          {errors.usernameOrEmail && <p className="error-text">{errors.usernameOrEmail}</p>}

          <label>Password</label>
          <div className="input-icon">
            <input
              type="password"
              name="password"
              value={formData.password || ''}
              onChange={handleChange}
              placeholder="••••••••"
            />
            <Lock size={18} />
          </div>
          {errors.password && <p className="error-text">{errors.password}</p>}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        <p className="login-footer">
          Don’t have an account?{' '}
          <a href="/register" className="register-link">Register</a>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
