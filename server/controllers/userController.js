import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Community from '../models/Community.js';
import Post from '../models/Post.js';
import bcrypt from 'bcryptjs';
import { generateToken, cookieOptions } from '../utils/token.js';
import { createNotification } from './notificationController.js';


// @desc    Register a new user
// @route   POST /api/users/register
export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('All fields are required');
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existingUser) {
    res.status(400);
    throw new Error('Username or email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, passwordHash });

  const token = generateToken({ id: user._id, username: user.username });

  // Create welcome notification
  await createNotification({
    userId: user._id,
    type: 'system',
    message: 'Welcome to Discussly! Start by exploring communities and creating your first post.',
    link: '/explore'
  });

  console.log(`👤 New user registered: ${username}`);
  res
    .cookie('token', token, cookieOptions)
    .status(201)
    .json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
});

// @desc    Login a user
// @route   POST /api/users/login
export const login = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    res.status(400);
    throw new Error('All fields are required');
  }

  console.log('🔐 Login attempt for:', usernameOrEmail);

  const user = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(400);
    throw new Error('Invalid credentials');
  }

  const token = generateToken({ id: user._id, username: user.username });

  console.log(`✅ User logged in: ${user.username}`);
  res
    .cookie('token', token, cookieOptions)
    .status(200)
    .json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
});

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('-passwordHash')
    .populate('joinedCommunities', 'name _id image')
    .populate('followers', 'username _id image')
    .populate('following', 'username _id image');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const createdCommunities = await Community.find({ createdBy: req.user.id }).select('name _id image');

  const posts = await Post.find({ author: req.user.id })
    .select('title _id community createdAt upvotes downvotes')
    .populate('community', 'name _id image');

  res.status(200).json({
    ...user.toObject(),
    createdCommunities,
    posts,
  });
})

// @desc    Logout user (clear cookie)
// @route   POST /api/users/logout
export const logout = (req, res) => {
  res.clearCookie('token', cookieOptions);
  console.log('👋 User logged out');
  res.status(200).json({ message: 'Logged out successfully' });
};

export const followUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const idOrUsername = decodeURIComponent(id);
  const currentUserId = req.user.id;

  // Find user to follow
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrUsername);
  const query = isObjectId 
    ? { _id: idOrUsername } 
    : { username: { $regex: new RegExp(`^${idOrUsername}$`, 'i') } };
  
  const userToFollow = await User.findOne(query);
  const currentUser = await User.findById(currentUserId);

  if (!userToFollow || !currentUser) {
    res.status(404);
    throw new Error("User not found");
  }
  
  const targetUserId = userToFollow._id.toString();

  if (userToFollow.followers.includes(currentUserId)) {
    res.status(400);
    throw new Error("Already following this user");
  }

  userToFollow.followers.push(currentUserId);
  currentUser.following.push(targetUserId);

  await userToFollow.save();
  await currentUser.save();

  // Create notification for the followed user
  await createNotification({
    userId: targetUserId,
    type: 'follow',
    message: `${currentUser.username} started following you`,
    link: `/user/${currentUserId}`,
    relatedUser: currentUserId
  });

  console.log(`👥 ${currentUser.username} followed ${userToFollow.username}`);
  res.status(200).json({ message: "Followed successfully" });
});

// Unfollow a user
export const unfollowUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const idOrUsername = decodeURIComponent(id);
  const currentUserId = req.user.id;

  // Find user to unfollow
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrUsername);
  const query = isObjectId 
    ? { _id: idOrUsername } 
    : { username: { $regex: new RegExp(`^${idOrUsername}$`, 'i') } };
  
  const userToUnfollow = await User.findOne(query);
  const currentUser = await User.findById(currentUserId);

  if (!userToUnfollow || !currentUser) {
    res.status(404);
    throw new Error("User not found");
  }

  const targetUserId = userToUnfollow._id.toString();

  userToUnfollow.followers = userToUnfollow.followers.filter(
    (uid) => uid.toString() !== currentUserId
  );
  currentUser.following = currentUser.following.filter(
    (uid) => uid.toString() !== targetUserId
  );

  await userToUnfollow.save();
  await currentUser.save();

  console.log(`👥 ${currentUser.username} unfollowed ${userToUnfollow.username}`);
  res.status(200).json({ message: "Unfollowed successfully" });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { username, email, image, bannerImage, bio, isPrivate } = req.body;

  // Validate if new username or email is already taken by *another* user
  if (username && username !== user.username) {
    const existingUserWithUsername = await User.findOne({ username });
    if (existingUserWithUsername && existingUserWithUsername._id.toString() !== user._id.toString()) {
      res.status(400);
      throw new Error('Username is already taken');
    }
    user.username = username;
  }

  if (email && email !== user.email) {
    const existingUserWithEmail = await User.findOne({ email });
    if (existingUserWithEmail && existingUserWithEmail._id.toString() !== user._id.toString()) {
      res.status(400);
      throw new Error('Email is already in use');
    }
    user.email = email;
  }

  if (image !== undefined) {
    user.image = image;
  }
  
  if (bannerImage !== undefined) {
    user.bannerImage = bannerImage;
  }
  
  if (bio !== undefined) {
    user.bio = bio;
  }

  if (typeof isPrivate === 'boolean') {
    user.isPrivate = isPrivate;
  }

  await user.save();

  console.log(`✏️ Profile updated for ${user.username}`);
  res.status(200).json({
    _id: user._id,
    username: user.username,
    email: user.email,
    image: user.image,
    bannerImage: user.bannerImage,
    bio: user.bio,
    isPrivate: user.isPrivate
  });
});


// @desc    Get user profile by username or ID
// @route   GET /api/users/:idOrUsername
// @access  Public
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const idOrUsername = decodeURIComponent(id);
  
  // Regex to check for a valid MongoDB ObjectId (24 hex characters)
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrUsername);
  
  const query = isObjectId 
    ? { _id: idOrUsername } 
    : { username: { $regex: new RegExp(`^${idOrUsername}$`, 'i') } };

  const user = await User.findOne(query)
    .select('-passwordHash')
    .populate('joinedCommunities', 'name _id image')
    .populate('followers', 'username _id image')
    .populate('following', 'username _id image');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const userId = user._id;

  const createdCommunities = await Community.find({ createdBy: userId }).select('name _id image');

  const posts = await Post.find({ author: userId })
    .select('title _id community createdAt upvotes downvotes content')
    .populate('community', 'name _id image');

  res.status(200).json({
    ...user.toObject(),
    createdCommunities,
    posts,
  });
});