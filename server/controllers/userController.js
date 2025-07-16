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
    .populate('joinedCommunities', 'name _id')
    .populate('followers', 'username _id')
    .populate('following', 'username _id');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const createdCommunities = await Community.find({ createdBy: req.user.id }).select('name _id');

  const posts = await Post.find({ author: req.user.id })
    .select('title _id community createdAt')
    .populate('community', 'name _id');

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
  const { id: targetUserId } = req.params;
  const currentUserId = req.user.id;

  if (currentUserId === targetUserId) {
    res.status(400);
    throw new Error("You can't follow yourself");
  }

  const userToFollow = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!userToFollow || !currentUser) {
    res.status(404);
    throw new Error("User not found");
  }

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
  const { id: targetUserId } = req.params;
  const currentUserId = req.user.id;

  const userToUnfollow = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!userToUnfollow || !currentUser) {
    res.status(404);
    throw new Error("User not found");
  }

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

  const { username, email, image, bio, isPrivate } = req.body;

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
    bio: user.bio,
    isPrivate: user.isPrivate
  });
});


// @desc    Get user profile by ID (public view)
// @route   GET /api/users/:id
// @access  Public
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select('-passwordHash')
    .populate('joinedCommunities', 'name _id')
    .populate('followers', 'username _id')
    .populate('following', 'username _id');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const createdCommunities = await Community.find({ createdBy: id }).select('name _id');

  const posts = await Post.find({ author: id })
    .select('title _id community createdAt')
    .populate('community', 'name _id');

  res.status(200).json({
    ...user.toObject(),
    createdCommunities,
    posts,
  });
});