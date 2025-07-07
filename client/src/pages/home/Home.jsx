import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Flame, Users, PenTool } from 'lucide-react';
import './Home.css';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const featureVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1
    }
  };

  return (
    <div className="home-container">
      <div className="background-decoration">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      <motion.div
        className="home-box"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="home-title">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Rocket size={32} className="title-icon" />
            </motion.div>
            Welcome to <span className="brand-highlight">Discussly</span>
          </h1>
        </motion.div>

        <motion.p
          className="home-subtitle"
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          A modern Reddit-style community platform where ideas come to life
        </motion.p>

        <motion.div
          className="home-features"
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="feature-card"
            variants={featureVariants}
            whileHover={{ y: -5, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="feature-icon trending">
              <Flame size={24} />
            </div>
            <div className="feature-content">
              <h3>Trending Posts</h3>
              <p>Discover hot topics</p>
            </div>
          </motion.div>

          <motion.div
            className="feature-card"
            variants={featureVariants}
            whileHover={{ y: -5, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="feature-icon create">
              <PenTool size={24} />
            </div>
            <div className="feature-content">
              <h3>Create & Discuss</h3>
              <p>Share your thoughts</p>
            </div>
          </motion.div>

          <motion.div
            className="feature-card"
            variants={featureVariants}
            whileHover={{ y: -5, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="feature-icon community">
              <Users size={24} />
            </div>
            <div className="feature-content">
              <h3>Join Communities</h3>
              <p>Connect with others</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.a
            href="/login"
            className="home-button"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(79, 158, 252, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="button-icon">🚀</span>
            Get Started
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;