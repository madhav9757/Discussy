import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { User, Copy, Check } from 'lucide-react'; // Import Copy and Check icons

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
  const [deletePost] = useDeletePostMutation();

  const [upvoteCount, setUpvoteCount] = useState(0);
  const [downvoteCount, setDownvoteCount] = useState(0);
  const [copiedCodeBlocks, setCopiedCodeBlocks] = useState({}); // State to track copied status per block

  const progressBarRef = useRef(null); // Ref for the progress bar

  useEffect(() => {
    if (post) {
      setUpvoteCount(post.upvotes?.length || 0);
      setDownvoteCount(post.downvotes?.length || 0);
    }
  }, [post]);

  // Reading Progress Bar Logic
  useEffect(() => {
    const handleScroll = () => {
      if (progressBarRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
        progressBarRef.current.style.width = `${scrollPercent}%`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await deletePost(post._id).unwrap();
      toast.success("Post deleted successfully!");
      navigate(`/community/${post.community?._id || ''}`);
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete post");
    }
  };

  const handleVote = async (type) => {
    if (!user) {
      toast.info("Please log in to vote.");
      navigate('/login');
      return;
    }
    try {
      const res = await toggleVote({ id, type }).unwrap();
      setUpvoteCount(res.upvotes);
      setDownvoteCount(res.downvotes);
    } catch (err) {
      console.error('Vote failed:', err);
      toast.error("Failed to cast vote.");
    }
  };

  const handleUpvote = () => handleVote('upvote');
  const handleDownvote = () => handleVote('downvote');

  const currentUserVote = post?.upvotes?.includes(user?._id)
    ? 'upvote'
    : post?.downvotes?.includes(user?._id)
      ? 'downvote'
      : null;

  // Custom renderer for code blocks to add copy button
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeContent = String(children).replace(/\n$/, '');
      const codeId = `code-block-${node.position.start.line}-${node.position.start.column}`; // Simple unique ID

      const handleCopyCode = async () => {
        try {
          await navigator.clipboard.writeText(codeContent);
          setCopiedCodeBlocks(prev => ({ ...prev, [codeId]: true }));
          setTimeout(() => {
            setCopiedCodeBlocks(prev => ({ ...prev, [codeId]: false }));
          }, 2000); // Reset "Copied!" state after 2 seconds
          toast.success("Code copied to clipboard!");
        } catch (err) {
          console.error("Failed to copy code: ", err);
          toast.error("Failed to copy code.");
        }
      };

      return !inline && match ? (
        <div style={{ position: 'relative' }}> {/* Wrapper for relative positioning */}
          <pre className={className} {...props}>
            <button
              className={`copy-code-button ${copiedCodeBlocks[codeId] ? 'copied' : ''}`}
              onClick={handleCopyCode}
              aria-label="Copy code to clipboard"
            >
              {copiedCodeBlocks[codeId] ? <Check size={16} /> : <Copy size={16} />}
              {copiedCodeBlocks[codeId] ? ' Copied!' : ' Copy'}
            </button>
            <code className={className} {...props}>
              {codeContent}
            </code>
          </pre>
        </div>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  if (isLoading) return <div className="loading">Loading post...</div>;
  if (isError || !post) return <div className="error">❌ Post not found or failed to load.</div>;

  return (
    <div className="post-details-page"> {/* New top-level container */}
      <div className="reading-progress-bar" ref={progressBarRef}></div> {/* Progress bar */}

      {/* Parallax Header */}
      <div className="parallax-header">
        <div className="parallax-content">
          <h1>{post.title}</h1>
          <div className="parallax-metadata">
            <span className="parallax-meta-item parallax-category">
              🎮 {post.category || 'Discussion'}
            </span>
            <span className="parallax-meta-item">
              🌐 <Link className="parallax-meta-link" to={`/community/${post.community._id}`}>
                r/{post.community.name}
              </Link>
            </span>
            <span className="parallax-meta-item">
              👤 <Link className="parallax-meta-link" to={`/user/${post.author._id}`}>
                {post.author.username}
              </Link>
            </span>
            <span className="parallax-meta-item">
              ⏰ {formatDateTime(post.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="post-details-container"> {/* This is the main content area now */}
        <button className="back-button" onClick={() => navigate(-1)} aria-label="Go back">
          <MdArrowBack /> Back to Community
        </button>

        <div className="post-content-wrapper">
          <div className="main-post-column">
            <div className="post-box">
              {/* The actual post content, excluding the title which is now in parallax header */}
              {/* <h1 className="post-title">{post.title}</h1> This is moved to parallax header */}

              <div className="post-meta">
                <span className="meta-item">
                  🌐 <Link className="meta-link" to={`/community/${post.community._id}`}>r/{post.community.name}</Link>
                </span>
                <span className="meta-item">
                  👤 <Link className="meta-link" to={`/user/${post.author._id}`}>{post.author.username}</Link>
                </span>
                <span className="meta-item">
                  ⏰ {formatDateTime(post.createdAt)}
                </span>
              </div>

              <div className="post-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={components} // Pass custom components here
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              <div className="post-engagement">
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
                <button
                  className="comment-button"
                  onClick={() => document.getElementById('comments-section-id')?.scrollIntoView({ behavior: 'smooth' })}
                  aria-label="Scroll to comments"
                >
                  💬 {comments.length === 0 ? 'No Comments Yet' : `Comments (${comments.length})`}
                </button>
              </div>
            </div>

            <div className="comments-section" id="comments-section-id">
              <h3>Comments</h3>
              {user && !comments.some(c => c.createdBy?._id === user._id) ? (
                <CommentInput postId={id} onCommentAdded={refetch} />
              ) : (
                user && <p className="already-commented-msg">You’ve already commented on this post.</p>
              )}

              {loadingComments ? (
                <p className="loading">Loading comments...</p>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem key={comment._id} comment={comment} onRefresh={refetch} />
                ))
              ) : (
                <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
              )}
            </div>
          </div>

          <div className="post-sidebar">
            <div className="sidebar-module sidebar-vote-controls">
              <button
                className={`vote-button upvote-button ${currentUserVote === 'upvote' ? 'active' : ''}`}
                onClick={handleUpvote}
                data-tooltip="Upvote"
                aria-label="Upvote this post"
              >
                👍 <span className="vote-count">{upvoteCount}</span>
              </button>
              <button
                className={`vote-button downvote-button ${currentUserVote === 'downvote' ? 'active' : ''}`}
                onClick={handleDownvote}
                data-tooltip="Downvote"
                aria-label="Downvote this post"
              >
                👎 <span className="vote-count">{downvoteCount}</span>
              </button>
            </div>

            <div className="sidebar-module author-card-module">
              <h4>About the Author</h4>
              <img
                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${post.author.username}`}
                alt={post.author.username}
                className="author-avatar"
              />
              <Link to={`/user/${post.author._id}`} className="author-username">
                {post.author.username}
              </Link>
              {post.author.bio && <p className="author-bio">{post.author.bio}</p>}
              <div className="author-stats">
                <div className="author-stat-item">
                  Member since {new Date(post.author.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                <div className="author-stat-item">
                  {post.author.postsCount || 0} posts · {post.author.commentsCount || 0} comments
                </div>
              </div>
              <Link to={`/user/${post.author._id}`} className="view-profile-button">
                <User size={16} /> View Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailsPage;