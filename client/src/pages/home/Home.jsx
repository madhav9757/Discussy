import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Flame, Users, PenTool } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <motion.div
        className="home-box"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="home-title">
          <Rocket size={28} /> Welcome to <span>Discussly</span>
        </h1>

        <p className="home-subtitle">A modern Reddit-style community platform</p>

        <div className="home-features">
          <div className="feature-card">
            <Flame color="#f87171" size={20} />
            <span>Trending Posts</span>
          </div>
          <div className="feature-card">
            <PenTool color="#60a5fa" size={20} />
            <span>Create & Discuss</span>
          </div>
          <div className="feature-card">
            <Users color="#34d399" size={20} />
            <span>Join Communities</span>
          </div>
        </div>

        <a href="/login" className="home-button">🚀 Get Started</a>
      </motion.div>
    </div>
  );
};

export default Home;
