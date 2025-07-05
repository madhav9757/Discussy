import express from 'express';
import {
    getCommentsByPostId,
    createComment,
    updateComment,
    deleteComment,
    toggleCommentVote
} from '../controllers/commentController.js'; 
import { protect } from '../middleware/auth.js'; 

const router = express.Router();

// Route to get all comments for a specific post
// GET /api/posts/:postId/comments
router.get('/posts/:postId/comments', getCommentsByPostId);

// Route to create a new comment on a post
// POST /api/posts/:postId/comments
// Requires authentication: `protect` middleware ensures user is logged in
router.post('/posts/:postId/comments', protect, createComment);

// Routes for specific comments (by commentId)
// PUT /api/comments/:commentId - Update a comment
// DELETE /api/comments/:commentId - Delete a comment
// POST /api/comments/:commentId/vote - Toggle a vote on a comment
// All these also require authentication for obvious reasons
router
    .route('/comments/:commentId')
    .put(protect, updateComment)
    .delete(protect, deleteComment);

router.post('/comments/:commentId/vote', protect, toggleCommentVote);


export default router;