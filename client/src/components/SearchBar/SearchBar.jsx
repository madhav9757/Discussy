import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx'; // Make sure clsx is installed: npm install clsx
import { Search, X } from 'lucide-react'; // Make sure lucide-react is installed: npm install lucide-react
import './SearchBar.css';

const SearchBar = ({ searchQuery, onSearchChange, isSearchExpanded, setIsSearchExpanded }) => {
    const searchInputRef = useRef(null);
    const searchBarRef = useRef(null); // Ref for the entire search bar container

    // State for actual search results
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Dummy suggestions (can be removed if you only want real search results)
    const allSuggestions = ['AI Ethics', 'React Hooks', 'Frontend Frameworks 2025', 'Web Development Trends', 'User Profile Design', 'Latest News', 'GraphQL vs REST'];
    const filteredSuggestions = searchQuery
        ? allSuggestions.filter(s =>
            s.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : ['Latest News', 'User Profile Design', 'AI Ethics', 'Frontend Frameworks 2025'];

    // Focus on input when search is expanded
    useEffect(() => {
        if (isSearchExpanded && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchExpanded]);

    // Function to simulate fetching search results from an API
    // 💡 IMPORTANT: Replace this with your actual API call (e.g., using axios or the native fetch API)
    const fetchResults = useCallback(async (query) => {
        if (!query?.trim()) { // Use optional chaining for query to be safe
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // --- YOUR ACTUAL API CALL GOES HERE ---
            // Example using fetch:
            // const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            // if (!response.ok) {
            //     throw new Error(`HTTP error! status: ${response.status}`);
            // }
            // const data = await response.json();
            // setSearchResults(data.results);

            // Simulated network delay and dummy results for demonstration
            await new Promise(resolve => setTimeout(resolve, 500));
            const dummyResults = [
                { id: 1, title: `Result for "${query}" - Article 1`, url: '#', snippet: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
                { id: 2, title: `Result for "${query}" - Guide 2`, url: '#', snippet: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.' },
                { id: 3, title: `Result for "${query}" - Video 3`, url: '#', snippet: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.' },
            ].filter(result => result.title.toLowerCase().includes(query.toLowerCase())); // Filter dummy results

            setSearchResults(dummyResults);
        } catch (err) {
            console.error("Failed to fetch search results:", err);
            setError("Failed to fetch search results. Please try again.");
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array means this function is created once

    // Debounce effect for search query
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchQuery) { // Only fetch if there's a query
                fetchResults(searchQuery);
            } else {
                setSearchResults([]); // Clear results if query is empty
            }
        }, 300); // Debounce for 300ms

        return () => {
            clearTimeout(handler); // Cleanup the timeout on unmount or if searchQuery changes
        };
    }, [searchQuery, fetchResults]); // Re-run when searchQuery or fetchResults changes

    // Effect to close search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
                setIsSearchExpanded(false);
            }
        };

        if (isSearchExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchExpanded, setIsSearchExpanded]);

    // Function to handle Enter key press (optional, as debounce handles search-as-you-type)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission
            // If you want to trigger an immediate search on Enter without debounce:
            // fetchResults(searchQuery);
            // Optionally, collapse the search bar after pressing enter
            // setIsSearchExpanded(false);
        }
    };

    return (
        <div className={clsx('header-search', {
            'header-search--expanded': isSearchExpanded && window.innerWidth < 768 // For mobile expansion
        })}
        ref={searchBarRef} // Attach ref to the main search bar container
        >
            <div className="header-search-input-wrapper">
                <Search className="header-search-icon" />
                <input
                    type="text"
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onFocus={() => setIsSearchExpanded(true)} // Expand search on focus
                    onKeyDown={handleKeyDown} // Add keydown handler
                    ref={searchInputRef} // Attach ref to the input for focus
                />
                {isSearchExpanded && window.innerWidth < 768 && (
                    <button className="close-search-button" onClick={() => {
                        setIsSearchExpanded(false);
                        onSearchChange(''); // Clear search query when closing mobile search
                    }}>
                        <X size={20} />
                    </button>
                )}
                {!isSearchExpanded && window.innerWidth >= 768 && (
                    <span className="header-search-shortcut">⌘K</span>
                )}
            </div>

            <AnimatePresence>
                {/* Conditionally render dropdown when expanded and either query has length, or there are suggestions */}
                {isSearchExpanded && (searchQuery?.length > 0 || filteredSuggestions.length > 0) && (
                    <motion.div
                        className="search-dropdown"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isLoading && (
                            <div className="dropdown-section no-results">
                                <p>Searching...</p>
                            </div>
                        )}
                        {error && (
                            <div className="dropdown-section no-results error-message">
                                <p>{error}</p>
                            </div>
                        )}
                        {/* Show actual results if found and not loading/error */}
                        {!isLoading && !error && searchQuery && searchResults?.length > 0 && (
                            <div className="dropdown-section">
                                <h4>Search Results for "{searchQuery}"</h4>
                                <ul>
                                    {searchResults.map((result) => (
                                        <li key={result.id} onClick={() => {
                                            // Handle click on a search result (e.g., navigate to URL)
                                            window.location.href = result.url; // Or use navigate(result.url) from react-router-dom
                                            setIsSearchExpanded(false);
                                            onSearchChange(''); // Clear search after selection
                                        }}>
                                            <Search size={16} className="header-icon" />
                                            <span>{result.title}</span>
                                            <p className="search-result-snippet">{result.snippet}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {/* Show "No results" message if query has results but searchResults is empty */}
                        {!isLoading && !error && searchQuery && searchResults?.length === 0 && (
                            <div className="dropdown-section no-results">
                                <p>No results found for "{searchQuery}".</p>
                            </div>
                        )}
                        {/* Show suggestions if no search query, or if search query has no results and no error */}
                        {!isLoading && !error && !searchQuery && filteredSuggestions.length > 0 && (
                            <div className="dropdown-section">
                                <h4>Suggestions</h4>
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
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchBar;