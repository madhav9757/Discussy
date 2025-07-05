import Comment from '../models/Comment.js';
import Post from '../models/Post.js';    
import User from '../models/User.js';     

/**
 * @desc Get all comments for a specific post
 * @route GET /api/posts/:postId/comments
 * @access Public
 */
export const getCommentsByPostId = async (req, res) => {
    try {
        const { postId } = req.params;

        // Optional: Check if the post actually exists before fetching comments
        const postExists = await Post.findById(postId);
        if (!postExists) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const comments = await Comment.find({ postId })
            .populate('createdBy', 'username') // Populate the username of the comment creator
            .populate({
                path: 'parentId', // Populate the parent comment if it's a reply
                select: 'content createdBy', // Select content and createdBy for parent
                populate: {
                    path: 'createdBy', // Populate the creator of the parent comment
                    select: 'username'
                }
            })
            .sort({ createdAt: 1 }); // Sort by creation date (oldest first)

        res.status(200).json(comments);
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

    // Assuming req.user is populated by an authentication middleware
    // For example, if using JWT and passport.js: req.user._id
    const createdBy = req.user._id; // The ID of the authenticated user

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Comment content cannot be empty.' });
    }

    try {
        // Validate if the post exists
        const postExists = await Post.findById(postId);
        if (!postExists) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // If parentId is provided, validate if the parent comment exists
        if (parentId) {
            const parentCommentExists = await Comment.findById(parentId);
            if (!parentCommentExists) {
                return res.status(404).json({ message: 'Parent comment not found.' });
            }
            // Optional: Ensure parent comment belongs to the same post
            if (parentCommentExists.postId.toString() !== postId) {
                return res.status(400).json({ message: 'Parent comment does not belong to this post.' });
            }
        }

        const newComment = new Comment({
            postId,
            content: content.trim(),
            createdBy,
            parentId: parentId || null // Set to null if it's a top-level comment
        });

        await newComment.save();

        // Populate the createdBy field for the response
        await newComment.populate('createdBy', 'username');
        // If it's a reply, also populate parentId's createdBy for the response
        if (newComment.parentId) {
            await newComment.populate({
                path: 'parentId',
                select: 'createdBy',
                populate: {
                    path: 'createdBy',
                    select: 'username'
                }
            });
        }

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Server error creating comment.' });
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
    // const isAdmin = req.user.role === 'admin'; // If you have user roles

    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Check if the authenticated user is the creator OR an admin
        if (comment.createdBy.toString() !== userId.toString() /* && !isAdmin */) {
            return res.status(403).json({ message: 'Not authorized to delete this comment.' });
        }

        // Optional: Delete nested replies if you want cascade deletion
        // await Comment.deleteMany({ parentId: commentId });

        await comment.deleteOne(); // Use deleteOne() or findByIdAndDelete()

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
        const comment = await Comment.findById(commentId);
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

        res.status(200).json({
            message: 'Vote updated successfully.',
            upvotes: comment.upvotes.length,
            downvotes: comment.downvotes.length
        });

    } catch (error) {
        console.error('Error toggling comment vote:', error);
        res.status(500).json({ message: 'Server error toggling comment vote.' });
    }
};