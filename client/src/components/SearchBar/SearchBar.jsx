import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Search, X } from 'lucide-react';
import './SearchBar.css'

const SearchBar = ({ searchQuery, onSearchChange, isSearchExpanded, setIsSearchExpanded }) => {
    const searchInputRef = useRef(null);

    // Focus on input when search is expanded
    useEffect(() => {
        if (isSearchExpanded && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchExpanded]);

    const allSuggestions = ['AI Ethics', 'React Hooks', 'Frontend Frameworks 2025', 'Web Development Trends', 'User Profile Design', 'Latest News', 'GraphQL vs REST'];

    const filteredSuggestions = searchQuery
        ? allSuggestions.filter(s =>
            s.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : ['Latest News', 'User Profile Design', 'AI Ethics', 'Frontend Frameworks 2025'];

    return (
        <div className={clsx('header-search', {
            'header-search--expanded': isSearchExpanded && window.innerWidth < 768
        })}>
            <div className="header-search-input-wrapper">
                <Search className="header-search-icon" />
                <input
                    type="text"
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onFocus={() => setIsSearchExpanded(true)}
                    ref={searchInputRef}
                    aria-label="Search"
                />
                {/* Clear button if search is active */}
                {isSearchExpanded && searchQuery.length > 0 && (
                    <motion.button
                        className="search-clear-button"
                        onClick={() => onSearchChange('')}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        aria-label="Clear search"
                    >
                        <X size={18} />
                    </motion.button>
                )}
                <span className="header-search-shortcut">⌘K</span>
            </div>
            {/* Search Suggestions/Recent (Populated dynamically) */}
            <AnimatePresence>
                {isSearchExpanded && (
                    <motion.div
                        className="header-dropdown search-dropdown"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {filteredSuggestions.length > 0 ? (
                            <div className="dropdown-section">
                                <h4>{searchQuery ? 'Search Results' : 'Suggestions'}</h4>
                                <ul>
                                    {filteredSuggestions.map((item) => (
                                        <li key={item} onClick={() => {
                                            onSearchChange(item);
                                            setIsSearchExpanded(false);
                                        }}>
                                            <Search size={16} className="header-icon" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="dropdown-section no-results">
                                <p>No results found for "{searchQuery}".</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchBar;