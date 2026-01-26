// server/controllers/searchController.js
import Post from '../models/Post.js';
import Community from '../models/Community.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Search across all content types (posts, communities, users)
 * @route   GET /api/search?q=query&type=all&page=1&limit=20
 * @access  Public
 */
export const searchAll = asyncHandler(async (req, res) => {
  const { q, type = 'all', page = 1, limit = 20 } = req.query;

  // Validation
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ 
      message: 'Search query must be at least 2 characters',
      success: false 
    });
  }

  const searchTerm = q.trim();
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  let results = {
    posts: [],
    communities: [],
    users: [],
  };

  try {
    // Search Posts
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find(
        { $text: { $search: searchTerm } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('author', 'username _id image')
        .populate('community', 'name _id')
        .lean();

      results.posts = posts.map(post => ({
        ...post,
        score: post.upvotes.length - post.downvotes.length,
        commentCount: post.comments.length,
      }));
    }

    // Search Communities
    if (type === 'all' || type === 'communities') {
      const communities = await Community.find(
        { $text: { $search: searchTerm } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limitNum)
        .populate('createdBy', 'username _id')
        .lean();

      results.communities = communities.map(community => ({
        ...community,
        memberCount: community.members.length,
      }));
    }

    // Search Users (only if not private)
    if (type === 'all' || type === 'users') {
      const users = await User.find(
        {
          $text: { $search: searchTerm },
          isPrivate: false,
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .select('username bio image followers following')
        .limit(limitNum)
        .lean();

      results.users = users.map(user => ({
        ...user,
        followerCount: user.followers.length,
        followingCount: user.following.length,
      }));
    }

    // Response
    res.json({
      success: true,
      query: searchTerm,
      results,
      metadata: {
        page: parseInt(page),
        limit: limitNum,
        type,
        resultCounts: {
          posts: results.posts.length,
          communities: results.communities.length,
          users: results.users.length,
          total: results.posts.length + results.communities.length + results.users.length,
        },
      },
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      message: 'Search failed. Please try again.',
      success: false 
    });
  }
});

/**
 * @desc    Advanced post search with filters
 * @route   GET /api/search/posts
 * @access  Public
 */
export const searchPosts = asyncHandler(async (req, res) => {
  const {
    q,
    community,
    author,
    sortBy = 'relevance',
    page = 1,
    limit = 20,
    timeRange = 'all', // all, day, week, month, year
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // Build query
  let query = {};
  let projection = {};

  // Text search
  if (q && q.trim().length >= 2) {
    query.$text = { $search: q.trim() };
    projection.score = { $meta: 'textScore' };
  }

  // Filter by community
  if (community) {
    query.community = community;
  }

  // Filter by author
  if (author) {
    query.author = author;
  }

  // Time range filter
  if (timeRange !== 'all') {
    const now = new Date();
    const timeFilters = {
      day: new Date(now.setDate(now.getDate() - 1)),
      week: new Date(now.setDate(now.getDate() - 7)),
      month: new Date(now.setMonth(now.getMonth() - 1)),
      year: new Date(now.setFullYear(now.getFullYear() - 1)),
    };

    if (timeFilters[timeRange]) {
      query.createdAt = { $gte: timeFilters[timeRange] };
    }
  }

  // Build sort options
  let sortOptions = {};
  switch (sortBy) {
    case 'relevance':
      if (q) {
        sortOptions.score = { $meta: 'textScore' };
      } else {
        sortOptions.createdAt = -1;
      }
      break;
    case 'newest':
      sortOptions.createdAt = -1;
      break;
    case 'oldest':
      sortOptions.createdAt = 1;
      break;
    case 'top':
      // This will be handled via aggregation for accurate sorting
      break;
    default:
      sortOptions.createdAt = -1;
  }

  try {
    let posts;
    let total;

    if (sortBy === 'top') {
      // Use aggregation for sorting by score (upvotes - downvotes)
      const pipeline = [
        { $match: query },
        {
          $addFields: {
            voteScore: { $subtract: [{ $size: '$upvotes' }, { $size: '$downvotes' }] },
          },
        },
        { $sort: { voteScore: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limitNum },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
          },
        },
        {
          $lookup: {
            from: 'communities',
            localField: 'community',
            foreignField: '_id',
            as: 'community',
          },
        },
        { $unwind: '$author' },
        { $unwind: '$community' },
        {
          $project: {
            'author.passwordHash': 0,
            'author.email': 0,
          },
        },
      ];

      [posts, total] = await Promise.all([
        Post.aggregate(pipeline),
        Post.countDocuments(query),
      ]);
    } else {
      // Regular query with sort
      [posts, total] = await Promise.all([
        Post.find(query, projection)
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .populate('author', 'username _id image')
          .populate('community', 'name _id')
          .lean(),
        Post.countDocuments(query),
      ]);
    }

    // Enhance post data
    const enhancedPosts = posts.map(post => ({
      ...post,
      score: post.upvotes?.length - post.downvotes?.length || 0,
      commentCount: post.comments?.length || 0,
    }));

    res.json({
      success: true,
      query: q,
      posts: enhancedPosts,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: skip + limitNum < total,
        hasPrev: parseInt(page) > 1,
      },
      filters: {
        community,
        author,
        sortBy,
        timeRange,
      },
    });

  } catch (error) {
    console.error('Post search error:', error);
    res.status(500).json({ 
      message: 'Post search failed. Please try again.',
      success: false 
    });
  }
});

/**
 * @desc    Search communities with filters
 * @route   GET /api/search/communities
 * @access  Public
 */
export const searchCommunities = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    sortBy = 'relevance',
    page = 1,
    limit = 20,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // Build query
  let query = {};
  let projection = {};

  if (q && q.trim().length >= 2) {
    query.$text = { $search: q.trim() };
    projection.score = { $meta: 'textScore' };
  }

  if (category) {
    query.category = category.toLowerCase();
  }

  // Sort options
  let sortOptions = {};
  switch (sortBy) {
    case 'relevance':
      sortOptions = q ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
      break;
    case 'members':
      // Will use aggregation
      break;
    case 'newest':
      sortOptions.createdAt = -1;
      break;
    default:
      sortOptions.createdAt = -1;
  }

  try {
    let communities;
    let total;

    if (sortBy === 'members') {
      const pipeline = [
        { $match: query },
        {
          $addFields: {
            memberCount: { $size: '$members' },
          },
        },
        { $sort: { memberCount: -1 } },
        { $skip: skip },
        { $limit: limitNum },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdBy',
          },
        },
        { $unwind: '$createdBy' },
        {
          $project: {
            'createdBy.passwordHash': 0,
            'createdBy.email': 0,
          },
        },
      ];

      [communities, total] = await Promise.all([
        Community.aggregate(pipeline),
        Community.countDocuments(query),
      ]);
    } else {
      [communities, total] = await Promise.all([
        Community.find(query, projection)
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .populate('createdBy', 'username _id')
          .lean(),
        Community.countDocuments(query),
      ]);
    }

    const enhancedCommunities = communities.map(community => ({
      ...community,
      memberCount: community.members?.length || 0,
    }));

    res.json({
      success: true,
      query: q,
      communities: enhancedCommunities,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: skip + limitNum < total,
        hasPrev: parseInt(page) > 1,
      },
      filters: {
        category,
        sortBy,
      },
    });

  } catch (error) {
    console.error('Community search error:', error);
    res.status(500).json({ 
      message: 'Community search failed. Please try again.',
      success: false 
    });
  }
});

/**
 * @desc    Get search suggestions (autocomplete)
 * @route   GET /api/search/suggestions
 * @access  Public
 */
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json({ suggestions: [] });
  }

  const searchTerm = q.trim();
  const searchRegex = new RegExp(`^${searchTerm}`, 'i');

  try {
    const [postTitles, communityNames, usernames] = await Promise.all([
      Post.find({ title: searchRegex })
        .select('title')
        .limit(3)
        .lean(),
      Community.find({ name: searchRegex })
        .select('name')
        .limit(3)
        .lean(),
      User.find({ username: searchRegex, isPrivate: false })
        .select('username')
        .limit(3)
        .lean(),
    ]);

    const suggestions = [
      ...postTitles.map(p => ({ type: 'post', text: p.title, id: p._id })),
      ...communityNames.map(c => ({ type: 'community', text: c.name, id: c._id })),
      ...usernames.map(u => ({ type: 'user', text: u.username, id: u._id })),
    ].slice(0, 10);

    res.json({ suggestions });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.json({ suggestions: [] });
  }
});