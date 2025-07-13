import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Flame, Users, PenTool, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

// Assuming you have these hooks and components
import { useGetPostsQuery } from '../../app/api/postsApi.js';
import PostCard from '../../components/postCard/PostCard.jsx';

import './Home.css';

const Home = () => {
  const { data: latestPosts = [], isLoading: isLoadingPosts } = useGetPostsQuery({
    // It's good practice to fetch a limited number of recent posts here.
    // Example: { limit: 3, sortBy: 'createdAt', order: 'desc' }
    // Adjust based on your API's capabilities.
  });

  // Framer Motion Variants (kept as is)
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.15
      }
    }
  };

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

  // buttonVariants are no longer needed if the buttons are removed
  // If you reintroduce buttons elsewhere, you'd put them back.
  // const buttonVariants = {
  //   hidden: { scale: 0.8, opacity: 0 },
  //   visible: {
  //     scale: 1,
  //     opacity: 1,
  //     transition: {
  //       type: "spring",
  //       stiffness: 100,
  //       damping: 10
  //     }
  //   }
  // };

  return (
    <div className="home-container">
      {/* Background decorative shapes */}
      <div className="background-decoration">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
      </div>

      {/* Main content box */}
      <motion.div
        className="home-box"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div
          className="home-hero-section"
          variants={textItemVariants}
        >
          <h1 className="home-title">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
              className="title-icon-wrapper"
            >
              <Rocket size={40} className="title-icon" />
            </motion.div>
            Welcome to <span className="brand-highlight">Discussly</span>
          </h1>
          <p className="home-subtitle">
            A modern Reddit-style community platform where ideas come to life.
          </p>
        </motion.div>

        {/* Feature Cards Section */}
        <div className="home-section home-features-section">
            <h2 className="section-heading">Quick Start</h2>
            <motion.div
              className="home-features-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
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
        </div>

        {/* Latest Posts Section */}
        <div className="home-section latest-posts-section">
          <h2 className="section-heading"><Clock size={22} color="#60a5fa" /> Latest Posts</h2>
          <div className="card-grid">
            {isLoadingPosts ? (
              <p className="loading-text">Loading latest posts...</p>
            ) : latestPosts.length > 0 ? (
              latestPosts.slice(0, 3).map(post => (
                <PostCard key={post._id} post={post} />
              ))
            ) : (
              <p className="empty-text">No posts available yet. Be the first to create one!</p>
            )}
          </div>
          {latestPosts.length > 0 && (
            <Link to="/explore" className="view-all-button">View All Posts</Link>
          )}
        </div>

        {/* Call to action buttons - REMOVED */}
        {/* The entire <motion.div className="home-cta-buttons"> section is gone */}

      </motion.div>
    </div>
  );
};

export default Home;