import express from 'express';
import { createCommunity, getAllCommunities, getCommunityById } from '../controllers/communityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllCommunities);
router.post('/', protect, createCommunity); 
router.get('/:id', protect, getCommunityById )

export default router;
