import Post from '../models/Post.js';
import Community from '../models/Community.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc Get trending posts (highest score + recentness)
export const getTrendingPosts = asyncHandler(async (req, res) => {
  const posts = await Post.aggregate([
    {
      $addFields: {
        score: { $subtract: [{ $size: { $ifNull: ["$upvotes", []] } }, { $size: { $ifNull: ["$downvotes", []] } }] }
      }
    },
    { $sort: { score: -1, createdAt: -1 } },
    { $limit: 10 }
  ]);

  // Manually populate since aggregate doesn't do it automatically
  const populatedPosts = await Post.populate(posts, [
    { path: 'author', select: 'username _id' },
    { path: 'community', select: 'name _id' }
  ]);

  res.json(populatedPosts);
});

// @desc Get popular communities (most members)
export const getPopularCommunities = asyncHandler(async (req, res) => {
  const communities = await Community.aggregate([
    {
      $addFields: {
        memberCount: { $size: { $ifNull: ["$members", []] } }
      }
    },
    { $sort: { memberCount: -1, createdAt: -1 } },
    { $limit: 10 }
  ]);
  
  const populatedCommunities = await Community.populate(communities, { path: 'createdBy', select: 'username' });
  res.json(populatedCommunities);
});

// @desc Get top creators (most posts)
export const getTopCreators = asyncHandler(async (req, res) => {
  const topCreators = await Post.aggregate([
    { $group: { _id: "$author", postCount: { $sum: 1 } } },
    { $sort: { postCount: -1 } },
    { $limit: 5 }
  ]);

  const populatedCreators = await User.populate(topCreators, { 
    path: '_id', 
    select: 'username _id followers bio' 
  });

  res.json(populatedCreators.map(c => ({
    user: c._id,
    postCount: c.postCount
  })));
});

// @desc Get new communities
export const getNewCommunities = asyncHandler(async (req, res) => {
  const communities = await Community.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('createdBy', 'username');
  res.json(communities);
});

// @desc Get community categories with counts
export const getCommunityCategories = asyncHandler(async (req, res) => {
  const categories = await Community.aggregate([
    { $match: { category: { $ne: null, $exists: true } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  res.json(categories);
});
