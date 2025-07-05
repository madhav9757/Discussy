import express from 'express';
import { createCommunity, getAllCommunities, getCommunityById, joinCommunity, leaveCommunity, deleteCommunity } from '../controllers/communityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllCommunities);
router.post('/', protect, createCommunity);
router.route('/:id')
    .get(getCommunityById)
    .delete(protect, deleteCommunity);
router.post('/:id/join', protect, joinCommunity);
router.post('/:id/leave', protect, leaveCommunity);

export default router;
