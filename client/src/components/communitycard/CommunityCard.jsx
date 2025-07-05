import React from 'react';
import './CommunityCard.css';
import { Link } from 'react-router-dom';

const CommunityCard = ({ community }) => {
  return (
    <div className="community-card">
      <h3>r/{community.name}</h3>
      <p>{community.description?.slice(0, 80)}</p>
      <small>{community.members?.length || 0} members</small>
    </div>
  );
};

export default CommunityCard;
