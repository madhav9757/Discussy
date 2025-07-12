import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Flame, Users, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        when: 'beforeChildren',
        staggerChildren: 0.15,
      },
    },
  };

  const textItemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  };

  const featureCardVariants = {
    hidden: { scale: 0.8, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="home-container">
      <div className="background-decoration">
        <div className="floating-shape shape-1" />
        <div className="floating-shape shape-2" />
        <div className="floating-shape shape-3" />
        <div className="floating-shape shape-4" />
        <div className="floating-shape shape-5" />
      </div>

      <motion.div
        className="home-box glassmorphism"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="home-title-wrapper" variants={textItemVariants}>
          <h1 className="home-title">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
              className="title-icon-wrapper"
            >
              <Rocket size={40} className="title-icon" />
            </motion.div>
            Welcome to <span className="brand-highlight">Discussly</span>
          </h1>
        </motion.div>

        <motion.p className="home-subtitle" variants={textItemVariants}>
          A modern Reddit-style community platform where ideas come to life.
        </motion.p>

        <motion.div
          className="home-features"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={featureCardVariants}
            whileHover={{ y: -8, scale: 1.03 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="feature-card-motion-wrapper"
          >
            <Link to="/explore" className="feature-card-link">
              <div className="feature-card">
                <div className="feature-icon feature-icon--trending">
                  <Flame size={28} />
                </div>
                <div className="feature-content">
                  <h3>Trending Posts</h3>
                  <p>Discover hot topics and engaging discussions.</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            variants={featureCardVariants}
            whileHover={{ y: -8, scale: 1.03 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="feature-card-motion-wrapper"
          >
            <Link to="/new-post" className="feature-card-link">
              <div className="feature-card">
                <div className="feature-icon feature-icon--create">
                  <PenTool size={28} />
                </div>
                <div className="feature-content">
                  <h3>Create & Discuss</h3>
                  <p>Share your thoughts, questions, and insights.</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            variants={featureCardVariants}
            whileHover={{ y: -8, scale: 1.03 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="feature-card-motion-wrapper"
          >
            <Link to="/communities" className="feature-card-link">
              <div className="feature-card">
                <div className="feature-icon feature-icon--community">
                  <Users size={28} />
                </div>
                <div className="feature-content">
                  <h3>Join Communities</h3>
                  <p>Connect with like-minded individuals and groups.</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div className="home-cta-buttons" variants={textItemVariants}>
          <motion.div
            variants={buttonVariants}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)',
            }}
            whileTap={{ scale: 0.95 }}
            className="home-button-motion-wrapper"
          >
            <Link to="/register" className="home-button home-button--primary">
              <span className="button-icon">✨</span> Join Discussly
            </Link>
          </motion.div>
          <motion.div
            variants={buttonVariants}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 30px rgba(100, 116, 139, 0.4)',
            }}
            whileTap={{ scale: 0.95 }}
            className="home-button-motion-wrapper"
          >
            <Link to="/explore" className="home-button home-button--secondary">
              <span className="button-icon">🔍</span> Explore Posts
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
