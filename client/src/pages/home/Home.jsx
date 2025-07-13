import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Flame, Users, PenTool } from 'lucide-react'; // MessageCircle removed as it's not used
// Link is no longer directly used for buttons, but kept if needed elsewhere for different navigation patterns
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  // Variants for staggered animation of the main content
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren", // Animate container before its children
        staggerChildren: 0.15 // Delay between children animations
      }
    }
  };

  // Variants for individual text elements (title, subtitle)
  const textItemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  // Variants for feature cards
  const featureCardVariants = {
    hidden: { scale: 0.8, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Variants for the main call-to-action button
  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring", // Spring animation for a bouncy feel
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <div className="home-container">
      {/* Background decorative shapes for visual flair */}
      <div className="background-decoration">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
      </div>

      {/* Main content box with entrance animation */}
      <motion.div
        className="home-box"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Title section */}
        <motion.div
          className="home-title-wrapper"
          variants={textItemVariants}
        >
          <h1 className="home-title">
            {/* Animated Rocket icon */}
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
              className="title-icon-wrapper"
            >
              <Rocket size={40} className="title-icon" />
            </motion.div>
            Welcome to <span className="brand-highlight">Discussly</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="home-subtitle"
          variants={textItemVariants}
        >
          A modern Reddit-style community platform where ideas come to life.
        </motion.p>

        {/* Feature cards section */}
        <motion.div
          className="home-features"
          variants={containerVariants} // Use container variants for staggered features
          initial="hidden"
          animate="visible"
        >
          {/* Trending Posts Feature Card */}
          {/* Link wraps motion.div correctly here, as motion.div gets the animation props */}
          <Link to="/explore" className="feature-card-link">
            <motion.div
              className="feature-card"
              variants={featureCardVariants}
              whileHover={{ y: -8, scale: 1.03, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.15)" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="feature-icon feature-icon--trending">
                <Flame size={28} />
              </div>
              <div className="feature-content">
                <h3>Trending Posts</h3>
                <p>Discover hot topics and engaging discussions.</p>
              </div>
            </motion.div>
          </Link>

          {/* Create & Discuss Feature Card */}
          <Link to="/new-post" className="feature-card-link">
            <motion.div
              className="feature-card"
              variants={featureCardVariants}
              whileHover={{ y: -8, scale: 1.03, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.15)" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="feature-icon feature-icon--create">
                <PenTool size={28} />
              </div>
              <div className="feature-content">
                <h3>Create & Discuss</h3>
                <p>Share your thoughts, questions, and insights.</p>
              </div>
            </motion.div>
          </Link>

          {/* Join Communities Feature Card */}
          <Link to="/communities" className="feature-card-link">
            <motion.div
              className="feature-card"
              variants={featureCardVariants}
              whileHover={{ y: -8, scale: 1.03, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.15)" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="feature-icon feature-icon--community">
                <Users size={28} />
              </div>
              <div className="feature-content">
                <h3>Join Communities</h3>
                <p>Connect with like-minded individuals and groups.</p>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Call to action buttons */}
        <motion.div
          className="home-cta-buttons"
          variants={textItemVariants} // Using textItemVariants for a slight delay
        >
          {/* Changed Link to motion.a and used href */}
          <motion.a
            href="/register" // Navigates to registration page
            className="home-button home-button--primary"
            variants={buttonVariants}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(79, 158, 252, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="button-icon">✨</span>
            Join Discussly
          </motion.a>

          {/* Changed Link to motion.a and used href */}
          <motion.a
            href="/explore" // Navigates to explore page
            className="home-button home-button--secondary"
            variants={buttonVariants}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(160, 174, 192, 0.2)" }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="button-icon">🔍</span>
            Explore Posts
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;