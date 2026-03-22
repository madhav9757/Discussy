import express from 'express';
import {
  getTrendingPosts,
  getPopularCommunities,
  getNewCommunities,
  getTopCreators,
  getCommunityCategories,
} from '../controllers/exploreController.js';

const router = express.Router();

router.get('/trending-posts', getTrendingPosts);
router.get('/popular-communities', getPopularCommunities);
router.get('/new-communities', getNewCommunities);
router.get('/top-creators', getTopCreators);
router.get('/categories', getCommunityCategories);

export default router;
