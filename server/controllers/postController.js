import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Community from "../models/Community.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createNotification } from "./notificationController.js";

// Utility to generate a clean URL slug from a title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with -
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
};

// @desc Get all posts
// @route GET /api/posts
export const getAllPosts = asyncHandler(async (req, res) => {
  let query = {};

  if (req.query.user) {
    const userParam = req.query.user;
    let user;

    // Check if it's an ObjectId
    if (userParam.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(userParam);
    }

    // If not found by ID, try Username
    if (!user) {
      user = await User.findOne({ username: userParam });
    }

    if (user) {
      query.author = user._id;
    } else {
      // If user not found, return empty array
      return res.status(200).json([]);
    }
  }

  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .populate({ path: "community", select: "name _id createdBy image" })
    .populate({ path: "author", select: "username _id image" })
    .lean();

  const postIds = posts.map((p) => p._id);
  const commentCounts = await Comment.aggregate([
    { $match: { postId: { $in: postIds } } },
    { $group: { _id: "$postId", count: { $sum: 1 } } },
  ]);

  const countMap = {};
  commentCounts.forEach(({ _id, count }) => {
    countMap[_id.toString()] = count;
  });

  const postsWithCount = posts.map((p) => ({
    ...p,
    commentCount: countMap[p._id.toString()] || 0,
  }));

  res.status(200).json(postsWithCount);
});

// @desc Create a post
// @route POST /api/posts
export const createPost = asyncHandler(async (req, res) => {
  const { title, content, community } = req.body;

  if (!title || !community) {
    res.status(400);
    throw new Error("Title and community are required");
  }

  // Initial slug from title
  let baseSlug = generateSlug(title);
  if (!baseSlug) baseSlug = "post";
  let slug = baseSlug;
  let counter = 1;

  // Ensure slug uniqueness
  while (await Post.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const post = await Post.create({
    title,
    content,
    community,
    slug,
    author: req.user._id,
  });

  const populatedPost = await Post.findById(post._id)
    .populate({ path: "community", select: "name _id createdBy image" })
    .populate({ path: "author", select: "username _id image" });

  const communityDetails = await Community.findById(community).populate(
    "members",
    "username _id",
  );

  if (communityDetails && communityDetails.members) {
    const notificationPromises = communityDetails.members
      .filter((member) => member._id.toString() !== req.user._id.toString())
      .map((member) =>
        createNotification({
          userId: member._id,
          type: "post",
          message: `${req.user.username} posted in r/${communityDetails.name}: "${title}"`,
          link: `/posts/${slug}`, // Link to SLUG
          relatedUser: req.user._id,
        }),
      );

    await Promise.all(notificationPromises);
  }

  res.status(201).json(populatedPost);
});

// @desc Get a single post by ID or Slug
// @route GET /api/posts/:idOrSlug
export const getPostById = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;

  let post;
  // Try ID first if it looks like one, otherwise try Slug
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    post = await Post.findById(idOrSlug)
      .populate("author", "username email image bio createdAt followers following bannerImage")
      .populate("community", "name description image bannerImage members createdAt category");
  }

  if (!post) {
    post = await Post.findOne({ slug: idOrSlug })
      .populate("author", "username email image bio createdAt followers following bannerImage")
      .populate("community", "name description image bannerImage members createdAt category");
  }

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
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
    .populate({ path: 'community', select: 'name _id createdBy image' })
    .populate({ path: 'author', select: 'username _id image' });

  console.log(`✏️ Post ${id} updated by ${req.user.username}`);
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
  console.log(`🗑️ Post ${id} deleted by ${req.user.username}`);
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

  const post = await Post.findById(id).populate('author', 'username _id image');

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
        type: "like",
        message: `${req.user.username} liked your post: "${post.title}"`,
        link: `/posts/${post.slug || post._id}`,
        relatedUser: userId,
      });
    }
  } else if (type === 'downvote' && !hasDownvoted) {
    post.downvotes.push(userId);
  }

  await post.save();

  console.log(`👍 Post ${id} ${type} by ${req.user.username}`);
  res.status(200).json({
    message: 'Vote updated successfully',
    upvotes: post.upvotes.length,
    downvotes: post.downvotes.length,
  });
});