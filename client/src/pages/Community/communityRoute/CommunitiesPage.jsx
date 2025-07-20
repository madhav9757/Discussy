import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCommunitiesQuery } from '../../../app/api/communitiesApi';
import Loader from '../../../components/loader/loader';
import CommunityCard from '../../../components/communitycard/CommunityCard';
import './CommunitiesPage.css';

// For Skeleton Loading
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// For Entry Animations
import { motion, AnimatePresence } from 'framer-motion';

// For Custom Icons (example, install react-icons if using)
// import { FaLaptopCode, FaGamepad, FaGraduationCap, FaLeaf } from 'react-icons/fa';

// Optional: For Mobile Trending Carousel
// import TrendingCarousel from './TrendingCarousel'; // You would create this component

const CommunitiesPage = () => {
  const navigate = useNavigate();
  const { data: communities = [], isLoading, isError } = useGetCommunitiesQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showTrending, setShowTrending] = useState(false); // New state for Trending Filter Tab
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false); // New state for Advanced Filter Panel
  const [minMembers, setMinMembers] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [activityLevelFilter, setActivityLevelFilter] = useState(''); // Requires activityLevel in community data

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.toLowerCase());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Skeleton Loading for Cards
  if (isLoading) {
    return (
      <div className="communities-page-container">
        <div className="communities-page-header">
          <h1>All Communities</h1>
        </div>
        <div className="communities-grid">
          {[...Array(6)].map((_, i) => ( // Show 6 skeleton cards
            <div key={i} className="community-wrapper">
              <Skeleton height={150} style={{ marginBottom: '0.5rem' }} />
              <Skeleton count={2} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) return <p className="error-message">Failed to load communities.</p>;

  const trendingIds = [...communities]
    .sort((a, b) => b.members.length - a.members.length)
    .slice(0, 3)
    .map((c) => c._id);

  const filteredCommunities = communities.filter((community) => {
    const matchesSearch = community.name.toLowerCase().includes(debouncedSearch);
    const matchesCategory = categoryFilter ? community.category === categoryFilter : true;
    const matchesTrending = showTrending ? trendingIds.includes(community._id) : true; // Trending Filter
    
    // Advanced Filters
    const matchesMinMembers = minMembers ? community.members.length >= parseInt(minMembers) : true;
    const matchesMaxMembers = maxMembers ? community.members.length <= parseInt(maxMembers) : true;
    const matchesActivityLevel = activityLevelFilter ? community.activityLevel === activityLevelFilter : true; // Requires community.activityLevel data

    return matchesSearch && matchesCategory && matchesTrending && matchesMinMembers && matchesMaxMembers && matchesActivityLevel;
  });

  return (
    <div className="communities-page-container">
      <div className="communities-page-header">
        <h1>All Communities</h1>
        <button
          className="create-community-btn"
          onClick={() => navigate('/create-community')}
        >
          + Create Community
        </button>
      </div>

      <div className="communities-controls">
        <input
          type="text"
          placeholder="Search communities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="community-search-input"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="community-filter-select"
        >
          <option value="">All Categories</option>
          <option value="tech">Tech {/* <FaLaptopCode /> */}</option>
          <option value="gaming">Gaming {/* <FaGamepad /> */}</option>
          <option value="education">Education {/* <FaGraduationCap /> */}</option>
          <option value="lifestyle">Lifestyle {/* <FaLeaf /> */}</option>
        </select>

        {/* Trending Filter Button */}
        <button
          className={`filter-trending-btn ${showTrending ? 'active' : ''}`}
          onClick={() => setShowTrending(!showTrending)}
        >
          {showTrending ? 'Showing Trending' : 'Show Trending'}
        </button>

        {/* Toggle Advanced Filters Button */}
        <button
          className="toggle-advanced-filters-btn"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
        </button>

        {/* Advanced Filter Panel (Collapsible) */}
        {showAdvancedFilters && (
          <div className="advanced-filters-panel">
            <label>
              Min Members:
              <input
                type="number"
                value={minMembers}
                onChange={(e) => setMinMembers(e.target.value)}
                className="community-filter-input"
                placeholder="Min"
              />
            </label>
            <label>
              Max Members:
              <input
                type="number"
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value)}
                className="community-filter-input"
                placeholder="Max"
              />
            </label>
            <label>
              Activity Level:
              <select
                value={activityLevelFilter}
                onChange={(e) => setActivityLevelFilter(e.target.value)}
                className="community-filter-select"
              >
                <option value="">All</option>
                <option value="High">High</option>
                <option value="Moderate">Moderate</option>
                <option value="Low">Low</option>
              </select>
            </label>
            {/* Add Date Created filter here if needed */}
          </div>
        )}
      </div>

      {/* Mobile-First: Responsive Card Carousel for Trending */}
      {/*
      {window.innerWidth <= 768 && trendingIds.length > 0 && (
        <div className="trending-carousel-section">
          <h2>🔥 Trending Communities</h2>
          <TrendingCarousel communities={communities.filter(c => trendingIds.includes(c._id))} />
        </div>
      )}
      */}

      <div className="communities-grid">
        <AnimatePresence>
          {filteredCommunities.length === 0 ? (
            // Empty State Illustration
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="empty-state"
            >
              <img src="/path/to/no-communities-illustration.svg" alt="No communities found" className="empty-state-illustration" />
              <p className="empty-state-message">No communities match your search or filter. Why not create one?</p>
              <button
                className="create-community-btn"
                onClick={() => navigate('/create-community')}
              >
                + Create New Community
              </button>
            </motion.div>
          ) : (
            filteredCommunities.map((community) => (
              <motion.div
                key={community._id}
                className="community-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {trendingIds.includes(community._id) && (
                  <span className="trending-badge animate-pulse">🔥 Trending</span>
                )}
                {/* Community Join Status (assuming community.isJoined is available) */}
                {community.isJoined && (
                  <span className="joined-badge">✅ Joined</span>
                )}
                <CommunityCard
                  community={community}
                  // Pass additional data for Community Card Enhancements
                  // e.g., postCount, activityLevel, isBookmarked
                  // community={{ ...community, postCount: 123, activityLevel: 'High', isBookmarked: false }}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommunitiesPage;