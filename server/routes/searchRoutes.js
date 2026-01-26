// server/routes/searchRoutes.js
import express from 'express';
import {
  searchAll,
  searchPosts,
  searchCommunities,
  getSearchSuggestions,
} from '../controllers/searchController.js';

const router = express.Router();

// General search across all content
router.get('/', searchAll);

// Specific search endpoints
router.get('/posts', searchPosts);
router.get('/communities', searchCommunities);
router.get('/suggestions', getSearchSuggestions);

export default router;