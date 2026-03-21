import express from 'express';
import {
    getCommentsByPostId,
    getCommentsByUser,
    createComment,
    updateComment,
    deleteComment,
    toggleCommentVote
} from '../controllers/commentController.js'; 
import { protect } from '../middleware/auth.js'; 

const router = express.Router();

// Get all comments by a specific user (for profile page)
// GET /api/comments/user/:userId
router.get('/comments/user/:userId', getCommentsByUser);

// Route to get all comments for a specific post
// GET /api/posts/:postId/comments
router.get('/posts/:postId/comments', getCommentsByPostId);

// Route to create a new comment on a post
// POST /api/posts/:postId/comments
router.post('/posts/:postId/comments', protect, createComment);

// Routes for specific comments (by commentId)
router
    .route('/comments/:commentId')
    .put(protect, updateComment)
    .delete(protect, deleteComment);

router.post('/comments/:commentId/vote', protect, toggleCommentVote);

export default router;