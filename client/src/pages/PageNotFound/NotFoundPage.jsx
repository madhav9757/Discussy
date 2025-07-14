// ./pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={{
        textAlign: 'center',
        padding: '50px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh' // Adjust as needed to center on screen
    }}>
      <h1>404 - Page Not Found</h1>
      <p>Oops! The page you are looking for does not exist.</p>
      <Link to="/" style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: 'var(--primary-color)', /* Uses your theme's primary color */
          color: 'var(--button-text-color)',      /* Uses your theme's button text color */
          textDecoration: 'none',
          borderRadius: '5px'
      }}>Go to Home</Link>
    </div>
  );
};

export default NotFoundPage;