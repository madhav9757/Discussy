import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import buildCommentTree from '../utils/buildCommentTree.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

/**
 * @desc Get all comments for a specific post
 * @route GET /api/posts/:postId/comments
 * @access Public
 */
export const getCommentsByPostId = async (req, res) => {
    try {
        const { postId } = req.params;

        const postExists = await Post.findById(postId);
        if (!postExists) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const comments = await Comment.find({ postId })
            .populate('createdBy', 'username')
            .populate({
                path: 'parentId',
                select: 'content createdBy',
                populate: {
                    path: 'createdBy',
                    select: 'username'
                }
            })
            .sort({ createdAt: 1 }) // or -1 for newest first
            .lean(); // For performance and easy mutation

        const nested = buildCommentTree(comments);

        res.status(200).json(nested);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Server error fetching comments.' });
    }
};

/**
 * @desc Create a new comment on a post (or as a reply to another comment)
 * @route POST /api/posts/:postId/comments
 * @access Private (requires authentication)
 */
export const createComment = async (req, res) => {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    const createdBy = req.user._id;

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Comment content cannot be empty.' });
    }

    try {
        // ✅ Validate post
        const post = await Post.findById(postId).populate('author', 'username _id');
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // ✅ Validate parent comment (if it's a reply)
        let parentComment = null;
        if (parentId) {
            parentComment = await Comment.findById(parentId).populate('createdBy', 'username _id');
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found.' });
            }
            if (parentComment.postId.toString() !== postId) {
                return res.status(400).json({ message: 'Parent comment does not belong to this post.' });
            }
        }

        // ✅ Create new comment
        const newComment = new Comment({
            postId,
            content: content.trim(),
            createdBy,
            parentId: parentId || null,
        });

        await newComment.save();

        // ✅ Populate author and parent author
        await newComment.populate('createdBy', 'username');

        if (newComment.parentId) {
            await newComment.populate({
                path: 'parentId',
                select: 'createdBy',
                populate: {
                    path: 'createdBy',
                    select: 'username',
                },
            });
        }

        // ✅ Create notification for post author (if not commenting on own post)
        if (post.author._id.toString() !== createdBy.toString()) {
            await createNotification({
                userId: post.author._id,
                type: 'comment',
                message: `${req.user.username} commented on your post: "${post.title}"`,
                link: `/posts/${postId}`,
                relatedUser: createdBy,
            });
        }

        // ✅ Create notification for parent comment author (if replying and not replying to self)
        if (parentComment && parentComment.createdBy._id.toString() !== createdBy.toString()) {
            await createNotification({
                userId: parentComment.createdBy._id,
                type: 'comment',
                message: `${req.user.username} replied to your comment`,
                link: `/posts/${postId}`,
                relatedUser: createdBy,
            });
        }

        console.log(`💬 New comment by ${req.user.username} on post ${postId}`);
        res.status(201).json(newComment);
    } catch (error) {
        console.error('❌ Error creating comment:', error);
        res.status(500).json({ message: 'Server error while creating comment.' });
    }
};

/**
 * @desc Update a comment
 * @route PUT /api/comments/:commentId
 * @access Private (requires authentication and ownership)
 */
export const updateComment = async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id; // Authenticated user's ID

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Comment content cannot be empty.' });
    }

    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Check if the authenticated user is the creator of the comment
        if (comment.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this comment.' });
        }

        comment.content = content.trim();
        await comment.save();

        // Re-populate for response
        await comment.populate('createdBy', 'username');
        if (comment.parentId) {
            await comment.populate({
                path: 'parentId',
                select: 'createdBy',
                populate: {
                    path: 'createdBy',
                    select: 'username'
                }
            });
        }

        console.log(`✏️ Comment ${commentId} updated by ${req.user.username}`);
        res.status(200).json(comment);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Server error updating comment.' });
    }
};

/**
 * @desc Delete a comment
 * @route DELETE /api/comments/:commentId
 * @access Private (requires authentication and ownership/admin)
 */
export const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id; // Authenticated user's ID

    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Check if the authenticated user is the creator
        if (comment.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this comment.' });
        }

        await comment.deleteOne();

        console.log(`🗑️ Comment ${commentId} deleted by ${req.user.username}`);
        res.status(200).json({ message: 'Comment deleted successfully.' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Server error deleting comment.' });
    }
};

/**
 * @desc Toggle upvote/downvote on a comment
 * @route POST /api/comments/:commentId/vote
 * @access Private (requires authentication)
 */
export const toggleCommentVote = async (req, res) => {
    const { commentId } = req.params;
    const { type } = req.body; // 'upvote' or 'downvote'
    const userId = req.user._id; // Authenticated user's ID

    if (!['upvote', 'downvote'].includes(type)) {
        return res.status(400).json({ message: 'Invalid vote type. Must be "upvote" or "downvote".' });
    }

    try {
        const comment = await Comment.findById(commentId).populate('createdBy', 'username _id');
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        const hasUpvoted = comment.upvotes.includes(userId);
        const hasDownvoted = comment.downvotes.includes(userId);

        if (type === 'upvote') {
            if (hasUpvoted) {
                // If already upvoted, remove upvote (un-upvote)
                comment.upvotes.pull(userId);
            } else {
                // If not upvoted, add upvote
                comment.upvotes.addToSet(userId);
                // If previously downvoted, remove downvote
                if (hasDownvoted) {
                    comment.downvotes.pull(userId);
                }

                // Create notification for comment author (if not voting on own comment)
                if (comment.createdBy._id.toString() !== userId.toString()) {
                    await createNotification({
                        userId: comment.createdBy._id,
                        type: 'like',
                        message: `${req.user.username} liked your comment`,
                        link: `/posts/${comment.postId}`,
                        relatedUser: userId
                    });
                }
            }
        } else { // type === 'downvote'
            if (hasDownvoted) {
                // If already downvoted, remove downvote (un-downvote)
                comment.downvotes.pull(userId);
            } else {
                // If not downvoted, add downvote
                comment.downvotes.addToSet(userId);
                // If previously upvoted, remove upvote
                if (hasUpvoted) {
                    comment.upvotes.pull(userId);
                }
            }
        }

        await comment.save();

        console.log(`👍 Comment ${commentId} ${type} by ${req.user.username}`);
        return res.status(200).json({
            message: "Vote updated successfully.",
            upvotes: comment.upvotes,
            downvotes: comment.downvotes,
            commentId: comment._id,
        });

    } catch (error) {
        console.error('Error toggling comment vote:', error);
        res.status(500).json({ message: 'Server error toggling comment vote.' });
    }
};