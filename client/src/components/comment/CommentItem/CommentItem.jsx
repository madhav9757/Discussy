import React, { useState } from 'react';
import { FaThumbsUp, FaThumbsDown, FaTrash, FaEdit } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useSelector } from 'react-redux';
import {
    useToggleCommentVoteMutation,
    useDeleteCommentMutation,
    useUpdateCommentMutation,
} from '../../../app/api/commentsApi';
import './CommentItem.css'

const CommentItem = ({ comment }) => {
    const user = useSelector((state) => state.auth.user);
    const isCurrentUser = user && comment.createdBy?._id === user._id;
    const [vote] = useToggleCommentVoteMutation();
    const [delComment] = useDeleteCommentMutation();
    const [updateComment] = useUpdateCommentMutation();
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    console.log('Is current user comment:', isCurrentUser);
    console.log('Redux user:', user);

    const handleVote = async (type) => {
        try {
            await vote({ commentId: comment._id, type }).unwrap();
        } catch (err) {
            console.error('Vote failed:', err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Delete this comment?')) {
            await delComment({ commentId: comment._id, postId: comment.postId });
        }
    };

    const handleEditSave = async () => {
        if (editContent.trim() === '') return;
        await updateComment({ commentId: comment._id, content: editContent, postId: comment.postId });
        setIsEditing(false);
    };

    const currentUserVote = comment.votes?.find((v) => v.userId === user?._id);

    return (
        <div className={`comment-box-enhanced ${isCurrentUser ? 'highlighted-comment' : ''}`}>
            <div className="comment-header">
                <strong>{comment.createdBy?.username || 'Anonymous'}</strong>
                {isCurrentUser && <span className="user-badge">• you</span>}
                <em>{new Date(comment.createdAt).toLocaleString()}</em>
            </div>

            {isEditing ? (
                <>
                    <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                    <button onClick={handleEditSave}>Save</button>
                </>
            ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {comment.content}
                </ReactMarkdown>
            )}

            <div className="comment-actions">
                <button
                    className={`comment-vote-btn ${currentUserVote?.type === 'upvote' ? 'upvoted' : ''}`}
                    onClick={() => handleVote('upvote')}
                >
                    <FaThumbsUp />
                </button>
                <span className="vote-count">
                    {comment.votes?.filter((v) => v.type === 'upvote').length || 0}
                </span>

                <button
                    className={`comment-vote-btn ${currentUserVote?.type === 'downvote' ? 'downvoted' : ''}`}
                    onClick={() => handleVote('downvote')}
                >
                    <FaThumbsDown />
                </button>
                <span className="vote-count">
                    {comment.votes?.filter((v) => v.type === 'downvote').length || 0}
                </span>

                {user?._id === comment.createdBy?._id && (
                    <>
                        <button onClick={() => setIsEditing(!isEditing)}><FaEdit /></button>
                        <button onClick={handleDelete}><FaTrash /></button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CommentItem;
