import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useSelector } from 'react-redux';
import './PostDetails.css';
import CommentInput from '../../components/comment/commentInput/CommentInput.jsx';
import CommentItem from '../../components/comment/CommentItem/CommentItem.jsx';

import { useGetPostByIdQuery, useToggleVoteMutation, useDeletePostMutation, useUpdatePostMutation } from '../../app/api/postsApi';
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
  const user = useSelector((state) => state.auth.userInfo);

  const { data: post, isLoading, isError, refetch } = useGetPostByIdQuery(id);
  const { data: comments = [], isLoading: loadingComments } = useGetCommentsByPostIdQuery(id);
  const [toggleVote] = useToggleVoteMutation();

  const [upvoteCount, setUpvoteCount] = useState(0);
  const [downvoteCount, setDownvoteCount] = useState(0);

  useEffect(() => {
    if (post) {
      setUpvoteCount(post.upvotes?.length || 0);
      setDownvoteCount(post.downvotes?.length || 0);
    }
  }, [post]);

  const [deletePost] = useDeletePostMutation();

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await deletePost(post._id).unwrap();
      toast.success("Post deleted successfully!");
      navigate(`/community/${post.community._id}`);
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete post");
    }
  };

  const handleVote = async (type) => {
    try {
      const res = await toggleVote({ id, type }).unwrap();
      setUpvoteCount(res.upvotes);
      setDownvoteCount(res.downvotes);
      refetch();
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  const handleUpvote = () => handleVote('upvote');
  const handleDownvote = () => handleVote('downvote');

  const currentUserVote = post?.upvotes?.includes(user._id)
    ? 'upvote'
    : post?.downvotes?.includes(user._id)
      ? 'downvote'
      : null;

  if (isLoading) return <div className="loading">Loading post...</div>;
  if (isError || !post) return <div className="error">❌ Post not found or failed to load.</div>;

  return (
    <div className="post-details-container">
      <div className="post-box">
        <button className="back-button" onClick={() => navigate(-1)} aria-label="Go back">
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
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        <div className="post-engagement">
          <div className="vote-controls">
            <button
              className={`vote-button upvote-button ${currentUserVote === 'upvote' ? 'active' : ''}`}
              onClick={handleUpvote}
            >
              👍 {post.upvotes?.length || 0}
            </button>
            <button
              className={`vote-button downvote-button ${currentUserVote === 'downvote' ? 'active' : ''}`}
              onClick={handleDownvote}
            >
              👎 {post.downvotes?.length || 0}
            </button>
          </div>
          {(user?._id === post.author._id || user?._id === post.community.createdBy) && (
            <div className="post-actions">
              <button className="edit-post-btn" onClick={() => navigate(`/edit-post/${post._id}`)}>
                ✏️ Edit
              </button>
              <button className="delete-post-btn" onClick={handleDeletePost}>
                🗑️ Delete
              </button>
            </div>
          )}
          <button className="comment-button" aria-label="Scroll to comments">
            💬 {comments.length === 0 ? 'No Comments Yet' : `Comments (${comments.length})`}
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h3>Comments</h3>
        {user && !comments.some(c => c.createdBy?._id === user._id) ? (
          <CommentInput postId={id} />
        ) : (
          <p className="already-commented-msg">You’ve already commented on this post.</p>
        )}

        {loadingComments ? (
          <p className="loading">Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem comment={comment} onRefresh={refetch} key={comment._id} />
          ))
        ) : (
          <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  );
};

export default PostDetailsPage;
