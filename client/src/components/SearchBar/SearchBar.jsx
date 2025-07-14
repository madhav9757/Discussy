// src/components/SearchBar/SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css'; // Create a new CSS file for SearchBar specific styles

const SearchBar = ({ onSearchSubmit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
    const searchInputRef = useRef(null);

    // Mock search suggestions (replace with actual data fetching if needed)
    const searchSuggestions = [
        'Trending: AI Ethics',
        'Post: New React Hooks',
        'User: JaneDoe',
        'Community: WebDev',
        'Trending: Climate Change',
        'Post: Svelte vs React'
    ];

    // Effect to handle click outside for closing search suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target) &&
                !event.target.closest('.search-suggestions-dropdown')) {
                setShowSearchSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Filtered search suggestions based on input
    const filteredSuggestions = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearchSubmit = (e) => {
        e.preventDefault(); // Prevent page reload if part of a form
        if (onSearchSubmit) {
            onSearchSubmit(searchTerm);
        }
        setShowSearchSuggestions(false); // Close suggestions after submit
    };

    return (
        <form className="search-bar-container" onSubmit={handleSearchSubmit}>
            <input
                ref={searchInputRef}
                type="text"
                placeholder="Search Discussly..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSearchSuggestions(true)}
                aria-label="Search Discussly"
            />
            <button type="submit" className="search-icon-button" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            {showSearchSuggestions && searchTerm.length > 0 && filteredSuggestions.length > 0 && (
                <div className="search-suggestions-dropdown">
                    {filteredSuggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className="suggestion-item"
                            onClick={() => {
                                setSearchTerm(suggestion);
                                setShowSearchSuggestions(false);
                                // Optionally, trigger search immediately on suggestion click
                                // if (onSearchSubmit) onSearchSubmit(suggestion);
                            }}
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            )}
        </form>
    );
};

export default SearchBar;