import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import './PostDetails.css';
import CommentInput from '../../components/commentInput/CommentInput.jsx';
import { useGetPostByIdQuery } from '../../app/api/postsApi';
import { useGetCommentsByPostIdQuery } from '../../app/api/commentsApi';

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const PostDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: post, isLoading, isError } = useGetPostByIdQuery(id);
  const { data: comments = [], isLoading: loadingComments } = useGetCommentsByPostIdQuery(id);

  const [upvoteCount, setUpvoteCount] = useState(0);
  const [downvoteCount, setDownvoteCount] = useState(0);

  useEffect(() => {
    if (post) {
      setUpvoteCount(post.upvotes?.length || 0);
      setDownvoteCount(post.downvotes?.length || 0);
    }
  }, [post]);

  const handleUpvote = () => {
    // Integrate backend mutation here
    setUpvoteCount((prev) => prev + 1);
  };

  const handleDownvote = () => {
    // Integrate backend mutation here
    setDownvoteCount((prev) => prev + 1);
  };

  if (isLoading) return <div className="loading">Loading post...</div>;
  if (isError || !post) return <div className="error">Post not found.</div>;

  return (
    <div className="post-details-container">
      <div className="post-box">
        <button className="back-button" onClick={() => navigate(-1)}>
          <MdArrowBack size={20} style={{ marginRight: '6px' }} /> Back to Community
        </button>

        <h1 className="post-title">{post.title}</h1>

        <div className="post-meta">
          <span className="meta-item">
            🌐 <a className="meta-link" href={`/community/${post.community._id}`}>r/{post.community.name}</a>
          </span>
          <span className="meta-item">
            👤 <a className="meta-link" href={`/user/${post.author._id}`}>{post.author.username}</a>
          </span>
          <span className="meta-item">
            ⏰ {formatDateTime(post.createdAt)}
          </span>
        </div>

        <div className="post-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {post.content}
          </ReactMarkdown>
        </div>

        <div className="post-engagement">
          <div className="vote-controls">
            <button className="vote-button upvote-button" onClick={handleUpvote}>
              👍 {upvoteCount}
            </button>
            <button className="vote-button downvote-button" onClick={handleDownvote}>
              👎 {downvoteCount}
            </button>
          </div>
          <button className="comment-button">
            💬 Comments ({comments.length})
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <CommentInput postId={id} />

        {loadingComments ? (
          <p className="loading">Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map((c) => (
            <div key={c._id} className="comment-box-enhanced">
              <div className="comment-header">
                <strong>{c.createdBy?.username || 'Unknown User'}</strong> ·{' '}
                <em>{formatDateTime(c.createdAt)}</em>
              </div>

              <div className="comment-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {c.content}
                </ReactMarkdown>
              </div>

              <div className="comment-actions">
                <button className="comment-vote-btn">👍</button>
                <span className="vote-count">{c.upvotes?.length || 0}</span>
                <button className="comment-vote-btn">👎</button>
                <span className="vote-count">{c.downvotes?.length || 0}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default PostDetailsPage;
