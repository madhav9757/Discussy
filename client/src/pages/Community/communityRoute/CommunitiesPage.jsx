import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCommunitiesQuery } from '../../../app/api/communitiesApi';
import Loader from '../../../components/loader/loader';
import CommunityCard from '../../../components/communitycard/CommunityCard';
import './CommunitiesPage.css';

// Import icons
import { FaSearch, FaFilter, FaSortAmountDown, FaFire, FaTimes, FaPlus, FaGlobe, FaArrowLeft, FaArrowRight, FaUsers, FaHashtag, FaComments } from 'react-icons/fa';

const CommunitiesPage = () => {
    const navigate = useNavigate();
    const { data: communities = [], isLoading, isError } = useGetCommunitiesQuery();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('membersDesc');
    const [showAdvancedFiltersSidebar, setShowAdvancedFiltersSidebar] = useState(false);
    const [minMembers, setMinMembers] = useState('');
    const [maxMembers, setMaxMembers] = useState('');
    const [activityLevel, setActivityLevel] = useState('');
    const [showTrendingOnly, setShowTrendingOnly] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false); // New state for search modal

    const carouselRef = useRef(null);
    const searchInputRef = useRef(null); // Ref for search input in modal

    // State to track window width for responsive button placement
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm.toLowerCase());
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Close advanced filters/search modal when Escape key is pressed
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (showAdvancedFiltersSidebar) setShowAdvancedFiltersSidebar(false);
                if (showSearchModal) setShowSearchModal(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showAdvancedFiltersSidebar, showSearchModal]);

    // Focus on search input when modal opens
    useEffect(() => {
        if (showSearchModal && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showSearchModal]);

    if (isLoading) return <Loader />;
    if (isError) return <p className="error-message">Failed to load communities.</p>;

    // Get unique categories for the filter dropdown
    const uniqueCategories = [...new Set(communities.map(c => c.category))].filter(Boolean);

    // Calculate trending communities (top 3 by members) - simplified for now
    const trendingCommunities = [...communities]
        .sort((a, b) => b.members.length - a.members.length)
        .slice(0, 3);
    const trendingIds = trendingCommunities.map((c) => c._id);

    let filteredAndSortedCommunities = [...communities];

    // Apply search filter
    if (debouncedSearch) {
        filteredAndSortedCommunities = filteredAndSortedCommunities.filter((community) =>
            community.name.toLowerCase().includes(debouncedSearch) ||
            community.description.toLowerCase().includes(debouncedSearch)
        );
    }

    // Apply category filter
    if (categoryFilter) {
        filteredAndSortedCommunities = filteredAndSortedCommunities.filter(
            (community) => community.category === categoryFilter
        );
    }

    // Apply advanced filters
    if (minMembers) {
        filteredAndSortedCommunities = filteredAndSortedCommunities.filter(
            (community) => community.members.length >= parseInt(minMembers)
        );
    }
    if (maxMembers) {
        filteredAndSortedCommunities = filteredAndSortedCommunities.filter(
            (community) => community.members.length <= parseInt(maxMembers)
        );
    }
    if (activityLevel) {
        filteredAndSortedCommunities = filteredAndSortedCommunities.filter(community => {
            const memberCount = community.members.length;
            if (activityLevel === 'high') return memberCount > 100;
            if (activityLevel === 'medium') return memberCount > 50 && memberCount <= 100;
            if (activityLevel === 'low') return memberCount <= 50;
            return true;
        });
    }

    // Apply sorting
    filteredAndSortedCommunities.sort((a, b) => {
        switch (sortOrder) {
            case 'membersDesc':
                return b.members.length - a.members.length;
            case 'membersAsc':
                return a.members.length - b.members.length;
            case 'nameAsc':
                return a.name.localeCompare(b.name);
            case 'nameDesc':
                return b.name.localeCompare(a.name);
            case 'createdAtDesc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'createdAtAsc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            default:
                return 0;
        }
    });

    // Filter for trending if toggle is active
    const displayedCommunities = showTrendingOnly
        ? filteredAndSortedCommunities.filter(community => trendingIds.includes(community._id))
        : filteredAndSortedCommunities;

    // Carousel navigation functions
    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = direction === 'left' ? -250 : 250;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('');
        setSortOrder('membersDesc');
        setMinMembers('');
        setMaxMembers('');
        setActivityLevel('');
        setShowTrendingOnly(false);
    };

    const handleSearchSelect = (communityId) => {
        setShowSearchModal(false);
        navigate(`/community/${communityId}`);
    };


    return (
        <div className="communities-page-container">
            <h1>
                <FaGlobe /> Discover Communities
            </h1>

            {/* NEW SCROLLABLE FILTER ACTION BAR */}
            <div className="filter-action-bar">
                {/* Create Community Button */}
                <button
                    className="create-community-btn-compact" /* New class for compact button */
                    onClick={() => navigate('/create-community')}
                    aria-label="Create New Community"
                >
                    <FaPlus /> <span className="button-text">Create</span>
                </button>

                {/* Search Icon Button */}
                <button
                    className="icon-btn search-icon-btn"
                    onClick={() => setShowSearchModal(true)}
                    aria-label="Open search"
                >
                    <FaSearch /> <span className="button-text-only-mobile">Search</span>
                </button>

                {/* Sort Order Select */}
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="compact-select"
                    aria-label="Sort communities by"
                >
                    <option value="membersDesc">Most Members</option>
                    <option value="membersAsc">Fewest Members</option>
                    <option value="nameAsc">Name (A-Z)</option>
                    <option value="nameDesc">Name (Z-A)</option>
                    <option value="createdAtDesc">Newest</option>
                    <option value="createdAtAsc">Oldest</option>
                </select>

                {/* Category Filter Select */}
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="compact-select"
                    aria-label="Filter communities by category"
                >
                    <option value="">All Categories</option>
                    {uniqueCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>

                {/* Filter Toggle Button */}
                <button
                    className={`icon-btn filter-toggle-btn ${showAdvancedFiltersSidebar ? 'active' : ''}`}
                    onClick={() => setShowAdvancedFiltersSidebar(!showAdvancedFiltersSidebar)}
                    aria-label={showAdvancedFiltersSidebar ? "Hide Advanced Filters" : "Show Advanced Filters"}
                >
                    <FaFilter /> <span className="button-text-only-mobile">Filters</span>
                </button>
            </div>


            {/* Advanced Filters Sidebar/Modal */}
            <div className={`advanced-filters-sidebar-overlay ${showAdvancedFiltersSidebar ? 'open' : ''}`}
                 onClick={() => setShowAdvancedFiltersSidebar(false)}></div>

            <div className={`advanced-filters-sidebar ${showAdvancedFiltersSidebar ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Advanced Filters</h3>
                    <button className="close-btn" onClick={() => setShowAdvancedFiltersSidebar(false)}>
                        <FaTimes />
                    </button>
                </div>

                <div className="filter-group">
                    <label htmlFor="minMembers"><FaUsers /> Min Members</label>
                    <input
                        id="minMembers"
                        type="number"
                        placeholder="e.g. 100"
                        value={minMembers}
                        onChange={(e) => setMinMembers(e.target.value)}
                        className="filter-input"
                        min="0"
                    />
                </div>
                <div className="filter-group">
                    <label htmlFor="maxMembers"><FaUsers /> Max Members</label>
                    <input
                        id="maxMembers"
                        type="number"
                        placeholder="e.g. 1000"
                        value={maxMembers}
                        onChange={(e) => setMaxMembers(e.target.value)}
                        className="filter-input"
                        min="0"
                    />
                </div>
                <div className="filter-group">
                    <label htmlFor="activityLevel"><FaComments /> Activity Level</label>
                    <select
                        id="activityLevel"
                        value={activityLevel}
                        onChange={(e) => setActivityLevel(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Any</option>
                        <option value="high">High (&gt;100 members)</option>
                        <option value="medium">Medium (51-100 members)</option>
                        <option value="low">Low (&le;50 members)</option>
                    </select>
                </div>
                <div className="filter-group">
                    <button
                        className={`filter-toggle-btn trending-toggle-btn ${showTrendingOnly ? 'active' : ''}`}
                        onClick={() => setShowTrendingOnly(!showTrendingOnly)}
                    >
                        <FaFire /> {showTrendingOnly ? 'Showing Trending' : 'Show Only Trending'}
                    </button>
                </div>

                <div className="filter-actions">
                    <button className="apply-filters-btn" onClick={() => setShowAdvancedFiltersSidebar(false)}>Apply Filters</button>
                    <button className="clear-filters-btn" onClick={handleClearFilters}>Clear All</button>
                </div>
            </div>

            {/* Search Modal */}
            <div className={`search-modal-overlay ${showSearchModal ? 'open' : ''}`}
                 onClick={() => setShowSearchModal(false)}>
                <div className="search-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="search-modal-header">
                        <h3>Search Communities</h3>
                        <button className="close-btn" onClick={() => setShowSearchModal(false)}>
                            <FaTimes />
                        </button>
                    </div>
                    <div className="search-modal-input-wrapper">
                        <FaSearch color="var(--color-text-secondary)" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Type to search communities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-modal-input"
                            aria-label="Search community"
                        />
                        {searchTerm && (
                            <button
                                className="clear-search-btn"
                                onClick={() => setSearchTerm('')}
                                aria-label="Clear search"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                    {searchTerm && (
                        <ul className="search-results-list">
                            {filteredAndSortedCommunities.length > 0 ? (
                                filteredAndSortedCommunities.map((community) => (
                                    <li key={community._id} onClick={() => handleSearchSelect(community._id)}>
                                        <span className="result-icon">{community.icon || '😀'}</span>
                                        <div className="result-details">
                                            <span className="result-name">{community.name}</span>
                                            <span className="result-members"><FaUsers /> {community.members.length} members</span>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li>No results found.</li>
                            )}
                        </ul>
                    )}
                </div>
            </div>


            {/* Trending Communities Carousel */}
            {trendingCommunities.length > 0 && (
                <div className="trending-communities-carousel">
                    <h3><FaFire /> Trending Communities</h3>
                    <div className="carousel-container" ref={carouselRef}>
                        {trendingCommunities.map((community) => (
                            <div
                                key={community._id}
                                className="trending-card"
                                onClick={() => navigate(`/community/${community._id}`)}
                            >
                                <span className="card-icon">{community.icon || '⭐'}</span>
                                <span className="card-name">{community.name}</span>
                                <span className="card-metric"><FaUsers /> {community.members.length} members</span>
                            </div>
                        ))}
                    </div>
                    {/* Carousel navigation arrows */}
                    <button className="carousel-nav-arrow left" onClick={() => scrollCarousel('left')} aria-label="Scroll left">
                        <FaArrowLeft />
                    </button>
                    <button className="carousel-nav-arrow right" onClick={() => scrollCarousel('right')} aria-label="Scroll right">
                        <FaArrowRight />
                    </button>
                </div>
            )}

            {/* Community Cards Grid/List */}
            <div className="communities-grid-scroll-wrapper">
                <div className="communities-grid">
                    {displayedCommunities.length === 0 ? (
                        <p className="no-communities-found">
                            <FaSearch className="icon" />
                            No communities found matching your criteria.
                            <br />
                            <span onClick={() => handleClearFilters()}>Try adjusting your filters</span> or
                            <span onClick={() => navigate('/create-community')}> be the first to create one!</span>
                        </p>
                    ) : (
                        displayedCommunities.map((community) => (
                            <div key={community._id} className="community-wrapper">
                                {trendingIds.includes(community._id) && (
                                    <span className="trending-badge animate-pulse">🔥 Trending</span>
                                )}
                                <CommunityCard
                                    community={{
                                        ...community,
                                        icon: community.icon || '😀',
                                        description: community.description || 'A vibrant community about this topic.'
                                    }}
                                    onClick={() => navigate(`/community/${community._id}`)}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunitiesPage;