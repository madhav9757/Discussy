import React from 'react';
import { Users, Search } from 'lucide-react';
import './CommunitiesPage.css';
import { useGetCommunitiesQuery } from '../../../app/api/communitiesApi'; // Adjust the path based on your project structure

// Function to generate a consistent color based on a string (e.g., community name or ID)
// This helps to visually distinguish communities without relying on images.
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  // Ensure the generated color has good contrast against white text
  // Simple luminance check for light/dark adjustment (optional, but good practice)
  const r = parseInt(color.substring(1,3), 16);
  const g = parseInt(color.substring(3,5), 16);
  const b = parseInt(color.substring(5,7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  if (luminance > 0.7) { // If too bright, darken it slightly
      color = '#' + (r - 30).toString(16).padStart(2, '0') + 
                    (g - 30).toString(16).padStart(2, '0') + 
                    (b - 30).toString(16).padStart(2, '0');
  }

  return color;
};

export default function CommunitiesPage() {
  // Use the RTK Query hook to fetch communities data
  const { data: communities, error, isLoading } = useGetCommunitiesQuery();

  // Show a loading message while data is being fetched
  if (isLoading) {
    return <div className="communities-page">Loading communities...</div>;
  }

  // Show an error message if the data fetching fails
  if (error) {
    return <div className="communities-page">Error loading communities: {error.message || 'Unknown error'}</div>;
  }

  return (
    <div className="communities-page">
      <div className="communities-header">
        <Users size={30} color="#a855f7" /> {/* Icon for communities */}
        <h1>Explore Communities</h1>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search communities..." />
        <button>
          <Search size={16} /> {/* Search icon */}
          Search
        </button>
      </div>

      <div className="communities-grid">
        {/* Conditionally render communities or a "not found" message */}
        {communities && communities.length > 0 ? (
          communities.map((community) => (
            <div className="community-card" key={community._id}>
              {/* Unique circle with initial and dynamic background color */}
              <div 
                className="community-initial-circle" 
                style={{ backgroundColor: stringToColor(community.name) }}
              >
                {/* Display the first letter of the community name, capitalized */}
                {community.name.charAt(0).toUpperCase()}
              </div>
              <div className="community-content">
                <h2>{community.name}</h2>
                <p>{community.description}</p>
                {/* Display the actual number of members from the fetched data */}
                <p className="community-members">{community.members.length} members</p>
              </div>
            </div>
          ))
        ) : (
          <p>No communities found.</p> // Message if no communities are available
        )}
      </div>
    </div>
  );
}