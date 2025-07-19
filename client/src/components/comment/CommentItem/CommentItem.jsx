import React, { useState } from 'react';
import { FaThumbsUp, FaThumbsDown, FaTrash, FaEdit, FaReply, FaTelegramPlane } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useSelector } from 'react-redux';
import {
    useToggleCommentVoteMutation,
    useDeleteCommentMutation,
    useUpdateCommentMutation,
    useCreateCommentMutation,
} from '../../../app/api/commentsApi';
import './CommentItem.css';

const CommentItem = ({ comment, onRefresh }) => {
    const user = useSelector((state) => state.auth.userInfo);
    const isCurrentUser = user && String(comment.createdBy?._id) === String(user._id);

    const [vote] = useToggleCommentVoteMutation();
    const [delComment] = useDeleteCommentMutation();
    const [updateComment] = useUpdateCommentMutation();
    const [createReply] = useCreateCommentMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);

    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    const currentUserVote = comment.upvotes.includes(user._id)
        ? 'upvote'
        : comment.downvotes.includes(user._id)
            ? 'downvote'
            : null;

    const handleVote = async (type) => {
        try {
            await vote({ commentId: comment._id, type }).unwrap();
            onRefresh();
        } catch (err) {
            console.error('Vote failed:', err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Delete this comment?')) {
            await delComment({ commentId: comment._id, postId: comment.postId });
            onRefresh();
        }
    };

    const handleEditSave = async () => {
        if (editContent.trim() === '') return;
        try {
            await updateComment({
                commentId: comment._id,
                content: editContent,
                postId: comment.postId,
            }).unwrap();

            setIsEditing(false);
            onRefresh();
        } catch (err) {
            console.error('Edit failed:', err);
        }
    };

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) return;
        try {
            await createReply({
                postId: comment.postId,
                content: replyContent,
                parentId: comment._id,
            }).unwrap();

            setReplyContent('');
            setShowReplyBox(false);
            onRefresh();
        } catch (err) {
            console.error('Reply failed:', err);
        }
    };

    return (
        <div className={`comment-box-enhanced ${isCurrentUser ? 'highlighted-comment' : ''}`}>
            <div className="comment-header">
                <strong>{comment.createdBy?.username || 'Anonymous'}</strong>
                {isCurrentUser && <span className="user-badge">• you</span>}
                <em>{new Date(comment.createdAt).toLocaleString()}</em>
            </div>

            {isEditing ? (
                <div className="edit-mode">
                    <textarea
                        className="edit-textarea"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                    />
                    <button className="save-edit-btn" onClick={handleEditSave}>Save</button>
                </div>
            ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {comment.content}
                </ReactMarkdown>
            )}

            <div className="comment-actions">
                <div className="vote-group">
                    <button
                        className={`comment-vote-btn ${currentUserVote === 'upvote' ? 'upvoted' : ''}`}
                        onClick={() => handleVote('upvote')}
                    >
                        <FaThumbsUp />
                    </button>
                    <span className="vote-count">{comment.upvotes.length}</span>

                    <button
                        className={`comment-vote-btn ${currentUserVote === 'downvote' ? 'downvoted' : ''}`}
                        onClick={() => handleVote('downvote')}
                    >
                        <FaThumbsDown />
                    </button>
                    <span className="vote-count">{comment.downvotes.length}</span>
                </div>

                {user && (
                    <div className="edit-delete-group">
                        <button onClick={() => setShowReplyBox(!showReplyBox)} className="icon-btn">
                            <FaReply />
                        </button>
                        {isCurrentUser && (
                            <>
                                <button onClick={() => setIsEditing(!isEditing)} className="icon-btn">
                                    <FaEdit />
                                </button>
                                <button onClick={handleDelete} className="icon-btn">
                                    <FaTrash />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {showReplyBox && (
                <div className="reply-box">
                    <textarea
                        className="reply-textarea"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                    />
                    <button onClick={handleReplySubmit} className="reply-submit-btn"><FaTelegramPlane size={20} /></button>
                </div>
            )}

            {comment.replies?.length > 0 && (
                <div className="comment-replies">
                    {comment.replies.map(reply => (
                        <CommentItem key={reply._id} comment={reply} onRefresh={onRefresh} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
