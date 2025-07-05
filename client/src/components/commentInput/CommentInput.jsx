import React, { useState } from 'react';
import { useCreateCommentMutation } from '../../app/api/commentsApi';
import './CommentInput.css';

const CommentInput = ({ postId, parentId = null }) => {
  const [content, setContent] = useState('');
  const [createComment, { isLoading }] = useCreateCommentMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createComment({ postId, content, parentId }).unwrap();
      setContent('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  return (
    <form className="comment-input-form" onSubmit={handleSubmit}>
      <textarea
        className="comment-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        rows={3}
        disabled={isLoading}
      />
      <button className="comment-submit-btn" type="submit" disabled={isLoading || !content.trim()}>
        {isLoading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
};

export default CommentInput;
