import React, { useState } from 'react';
import './RegisterPage.css';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { registerUser } from '../authSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await dispatch(registerUser(formData)).unwrap();

      const loginRes = await dispatch(
        loginUser({ usernameOrEmail: formData.email, password: formData.password })
      ).unwrap();

      toast.success('🎉 Registered & Logged in!');
      navigate('/');
    } catch (err) {
      toast.error(err || '❌ Something went wrong');
    }
  };

  return (
    <div className="register-container">
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
          <label>Username</label>
          <div className="input-icon">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
            />
            <User size={18} />
          </div>
          {errors.username && <p className="error-text">{errors.username}</p>}

          <label>Email</label>
          <div className="input-icon">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            <Mail size={18} />
          </div>
          {errors.email && <p className="error-text">{errors.email}</p>}

          <label>Password</label>
          <div className="input-icon">
            <input
              type="password"
              name="password"
              value={formData.password}
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
            className="register-btn"
          >
            Register
          </motion.button>
        </form>

        <p className="register-footer">
          Already have an account?{' '}
          <a href="/login" className="login-link">Login</a>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
