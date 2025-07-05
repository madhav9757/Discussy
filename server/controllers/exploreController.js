import Post from '../models/Post.js';
import Community from '../models/Community.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getTrendingPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().sort({ upvotes: -1 }).limit(5);
  res.json(posts);
});

export const getPopularCommunities = asyncHandler(async (req, res) => {
  const communities = await Community.find().sort({ membersCount: -1 }).limit(5);
  res.json(communities);
});

export const getNewCommunities = asyncHandler(async (req, res) => {
  const communities = await Community.find().sort({ createdAt: -1 }).limit(5);
  res.json(communities);
});
