import express from 'express';
import {
  getTrendingPosts,
  getPopularCommunities,
  getNewCommunities,
} from '../controllers/exploreController.js';

const router = express.Router();

router.get('/trending-posts', getTrendingPosts);
router.get('/popular-communities', getPopularCommunities);
router.get('/new-communities', getNewCommunities);

export default router;
