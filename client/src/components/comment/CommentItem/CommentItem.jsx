import React, { useState } from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

import 'highlight.js/styles/github-dark.css';
import './CommentItem.css'; 

const CommentItem = ({ comment }) => {
  const [voteState, setVoteState] = useState(null); 
  const [votes, setVotes] = useState({
    upvotes: comment.upvotes || 0,
    downvotes: comment.downvotes || 0,
  });

  const handleUpvote = () => {
    if (voteState === 'up') {
      setVoteState(null);
      setVotes((v) => ({ ...v, upvotes: v.upvotes - 1 }));
      // await removeVote(comment._id)
    } else {
      setVoteState('up');
      setVotes((v) => ({
        upvotes: v.upvotes + 1,
        downvotes: voteState === 'down' ? v.downvotes - 1 : v.downvotes,
      }));
      // await voteOnComment(comment._id, 'up')
    }
  };

  const handleDownvote = () => {
    if (voteState === 'down') {
      setVoteState(null);
      setVotes((v) => ({ ...v, downvotes: v.downvotes - 1 }));
      // await removeVote(comment._id)
    } else {
      setVoteState('down');
      setVotes((v) => ({
        downvotes: v.downvotes + 1,
        upvotes: voteState === 'up' ? v.upvotes - 1 : v.upvotes,
      }));
      // await voteOnComment(comment._id, 'down')
    }
  };

  return (
    <div className="comment-box-enhanced">
      <div className="comment-header">
        <strong>{comment.createdBy?.username || 'Anonymous'}</strong> ·{' '}
        <em>{new Date(comment.createdAt).toLocaleString()}</em>
      </div>

      <div className="comment-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {comment.content}
        </ReactMarkdown>
      </div>

      <div className="comment-actions">
        <button
          onClick={handleUpvote}
          className={`comment-vote-btn ${voteState === 'up' ? 'upvoted' : ''}`}
        >
          <FaThumbsUp />
        </button>
        <span className="vote-count">{votes.upvotes}</span>

        <button
          onClick={handleDownvote}
          className={`comment-vote-btn ${voteState === 'down' ? 'downvoted' : ''}`}
        >
          <FaThumbsDown />
        </button>
        <span className="vote-count">{votes.downvotes}</span>
      </div>
    </div>
  );
};

export default CommentItem;

