import express from 'express';
import { register, login, getProfile, logout, followUser, unfollowUser } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.post('/logout', logout);
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);

export default router;
