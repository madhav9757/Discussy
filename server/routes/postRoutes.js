import express from 'express';
import { createPost, updatePost, deletePost, getAllPosts, getPostById, toggleVote } from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllPosts);
router.post('/', protect, createPost); 
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.get('/:id', getPostById);
router.patch('/:id/vote', protect, toggleVote);

export default router;
