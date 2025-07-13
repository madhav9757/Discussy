import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Users, BookOpen } from 'lucide-react'; // Import icons
import './CommunityCard.css';

const CommunityCard = ({ community }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  // Ensure community data exists and provide fallbacks
  const communityName = community.name || 'Unknown Community';
  const descriptionSnippet = community.description
    ? community.description.slice(0, 100) + (community.description.length > 100 ? '...' : '')
    : 'No description available for this community.';
  const memberCount = community.members?.length || 0;
  const communityId = community._id || '#'; // Fallback for Link

  const handleClick = () => {
    navigate(`/community/${communityId}`); // Handle navigation
  };

  return (
    // Removed the <Link> wrapper here
    // Added onClick to the div and made it clickable via CSS
    <div className="community-card clickable" onClick={handleClick} aria-label={`View community ${communityName}`}>
      <div className="community-card-header">
        <BookOpen size={24} className="community-icon" /> {/* Icon for community */}
        <h3 className="community-name">r/{communityName}</h3>
      </div>
      <p className="community-description">{descriptionSnippet}</p>
      <div className="community-stats">
        <Users size={16} className="members-icon" />
        <small className="member-count">{memberCount} members</small>
      </div>
    </div>
  );
};

export default CommunityCard;