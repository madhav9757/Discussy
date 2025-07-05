import React from 'react';
import { useLocation } from 'react-router-dom';

const Layout = ({ children, scrollable = false }) => {
  const location = useLocation();

  // Optional: Detect scrollable routes
  const shouldScroll = scrollable || ['/posts', '/explore'].includes(location.pathname);

  return (
    <div
      
    >
      {children}
    </div>
  );
};

export default Layout;
