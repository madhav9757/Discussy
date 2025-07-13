import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowUp, ArrowDown } from 'lucide-react'; // Importing icons
import './Postcard.css';

const PostCard = ({ post }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/posts/${post._id}`);
  };

  const communityName = post.community?.name || 'unknown';
  const authorUsername = post.author?.username || 'anonymous';
  const displayTitle = post.title || 'Untitled Post';
  const displayContentSnippet = post.content
    ? post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')
    : 'No content preview available.';

  const upvotes = post.upvotes?.length || 0;
  const downvotes = post.downvotes?.length || 0;
  const commentCount = post.comments?.length || 0;
  const score = upvotes - downvotes;

  return (
    <div className="post-card" onClick={handleClick} aria-label={`View post: ${displayTitle}`}>
      <div className="post-card-header">
        <span className="post-card-community">r/{communityName}</span>
        <span className="post-card-author">Posted by u/{authorUsername}</span>
      </div>
      <h3 className="post-card-title">{displayTitle}</h3>
      <p className="post-card-content-snippet">{displayContentSnippet}</p>
      <div className="post-card-footer">
        <div className="post-card-votes">
          <ArrowUp size={18} className="vote-icon upvote-icon" />
          <span className="vote-score">{score}</span>
          <ArrowDown size={18} className="vote-icon downvote-icon" />
        </div>
        <div className="post-card-comments">
          <MessageSquare size={18} className="comment-icon" />
          <span>{commentCount} comments</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;