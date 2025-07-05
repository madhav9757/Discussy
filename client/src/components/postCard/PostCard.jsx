import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PostCard.css';

const PostCard = ({ post }) => {

  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/posts/${post._id}`);
  };
  return (
    <div id='post-card' onClick={handleClick} className='clickable'>
      <h3>{post.title}</h3>
      <p className="meta">r/{post.community?.name || 'unknown'}</p>
      <p className="author">by {post.author?.username || 'anonymous'}</p>
    </div>
  );
};

export default PostCard;
  