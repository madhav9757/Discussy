import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the Theme Context
export const ThemeContext = createContext();

// Custom hook to easily consume the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme Provider component
export const ThemeProvider = ({ children }) => {
  // State to manage the current theme
  const [theme, setTheme] = useState(() => {
    // Try to get theme from localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Fallback: Check user's system preference (prefers-color-scheme)
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' // System prefers dark mode
      : 'light'; // System prefers light mode or no preference
  });

  // Effect to update localStorage and apply the theme class to the body
  useEffect(() => {
    // Persist the current theme to localStorage
    localStorage.setItem('theme', theme);

    // Remove any existing theme-related classes ('light' or 'dark')
    // This is safer than `document.body.className = '';` as it preserves other classes.
    document.body.classList.remove('light', 'dark');

    // Add the appropriate theme class to the body element
    // Your CSS expects 'dark' class for dark mode and no class (default :root) for light mode.
    if (theme === 'dark') {
      document.body.classList.add('dark');
    }
    // No explicit 'light' class is needed on the body if :root handles the default light theme.
  }, [theme]); // Rerun this effect whenever the 'theme' state changes

  // Function to toggle between 'light' and 'dark' themes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Provide the theme state and toggle function to children components
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};