import Post from '../models/Post.js';
import Community from '../models/Community.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createNotification } from './notificationController.js';

// @desc Get all posts
// @route GET /api/posts
export const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate({ path: 'community', select: 'name _id createdBy' })
    .populate({ path: 'author', select: 'username _id' });

  res.status(200).json(posts);
});

// @desc Create a post
// @route POST /api/posts
export const createPost = asyncHandler(async (req, res) => {
  const { title, content, community } = req.body;

  if (!title || !community) {
    res.status(400);
    throw new Error('Title and community are required');
  }

  const post = await Post.create({
    title,
    content,
    community,
    author: req.user._id,
  });

  const populatedPost = await Post.findById(post._id)
    .populate({ path: 'community', select: 'name _id createdBy' })
    .populate({ path: 'author', select: 'username _id' });

  // Get community details for notification
  const communityDetails = await Community.findById(community).populate('members', 'username _id');
  
  // Notify community members (except the author)
  if (communityDetails && communityDetails.members) {
    const notificationPromises = communityDetails.members
      .filter(member => member._id.toString() !== req.user._id.toString())
      .map(member => 
        createNotification({
          userId: member._id,
          type: 'post',
          message: `${req.user.username} posted in r/${communityDetails.name}: "${title}"`,
          link: `/posts/${post._id}`,
          relatedUser: req.user._id
        })
      );
    
    await Promise.all(notificationPromises);
  }

  res.status(201).json(populatedPost);
});

export const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id)
    .populate('author', 'username email') // populate author fields
    .populate('community', 'name');       // populate community name

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  res.status(200).json(post);
});

// @desc Update a post
// @route PUT /api/posts/:id
export const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const post = await Post.findById(id).populate('community');

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const isAuthor = post.author.toString() === req.user._id.toString();
  const isCommunityCreator = post.community?.createdBy?.toString() === req.user._id.toString();

  if (!isAuthor && !isCommunityCreator) {
    res.status(403);
    throw new Error('You are not authorized to update this post');
  }

  post.title = title || post.title;
  post.content = content || post.content;

  const updatedPost = await post.save();

  const populatedPost = await Post.findById(updatedPost._id)
    .populate({ path: 'community', select: 'name _id createdBy' })
    .populate({ path: 'author', select: 'username _id' });

  res.json(populatedPost);
});

// @desc Delete a post
// @route DELETE /api/posts/:id
export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id).populate('community');

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const isAuthor = post.author.toString() === req.user._id.toString();
  const isCommunityCreator = post.community?.createdBy?.toString() === req.user._id.toString();

  if (!isAuthor && !isCommunityCreator) {
    res.status(403);
    throw new Error('You are not authorized to delete this post');
  }

  await post.deleteOne();
  res.status(200).json({ message: 'Post deleted successfully' });
});

// @desc Toggle post vote (upvote/downvote)
// @route PATCH /api/posts/:id/vote
export const toggleVote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // 'upvote' or 'downvote'
  const userId = req.user._id;

  if (!['upvote', 'downvote'].includes(type)) {
    res.status(400);
    throw new Error('Invalid vote type');
  }

  const post = await Post.findById(id).populate('author', 'username');

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const hasUpvoted = post.upvotes.includes(userId);
  const hasDownvoted = post.downvotes.includes(userId);

  // Remove user from both arrays first
  post.upvotes.pull(userId);
  post.downvotes.pull(userId);

  // Add vote only if not already selected
  if (type === 'upvote' && !hasUpvoted) {
    post.upvotes.push(userId);
    
    // Create notification for post author (if not voting on own post)
    if (post.author._id.toString() !== userId.toString()) {
      await createNotification({
        userId: post.author._id,
        type: 'like',
        message: `${req.user.username} liked your post: "${post.title}"`,
        link: `/posts/${id}`,
        relatedUser: userId
      });
    }
  } else if (type === 'downvote' && !hasDownvoted) {
    post.downvotes.push(userId);
  }

  await post.save();

  res.status(200).json({
    message: 'Vote updated successfully',
    upvotes: post.upvotes.length,
    downvotes: post.downvotes.length,
  });
});