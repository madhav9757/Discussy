import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Community from '../models/Community.js';
import Post from '../models/Post.js';
import bcrypt from 'bcryptjs';
import { generateToken, cookieOptions } from '../utils/token.js';


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

  console.log('🧪 req.body =', req.body);

  const user = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(400);
    throw new Error('Invalid credentials');
  }

  const token = generateToken({ id: user._id, username: user.username });

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
    posts, // ← added this
  });
})

// @desc    Logout user (clear cookie)
// @route   POST /api/users/logout
export const logout = (req, res) => {
  res.clearCookie('token', cookieOptions);
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

  res.status(200).json({ message: "Unfollowed successfully" });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id); // req.user.id comes from the protect middleware

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { username, email } = req.body;

  // Validate if new username or email is already taken by *another* user
  if (username && username !== user.username) {
    const existingUserWithUsername = await User.findOne({ username });
    if (existingUserWithUsername) {
      res.status(400);
      throw new Error('Username is already taken');
    }
    user.username = username;
  }

  if (email && email !== user.email) {
    const existingUserWithEmail = await User.findOne({ email });
    if (existingUserWithEmail) {
      res.status(400);
      throw new Error('Email is already in use');
    }
    user.email = email;
  }

  // You can add logic for updating other fields here, e.g., profile image
  // if (req.body.image) {
  //   user.image = req.body.image;
  // }

  await user.save(); // Save the updated user document

  // Respond with the updated user data (excluding password hash)
  res.status(200).json({
    _id: user._id,
    username: user.username,
    email: user.email,
    image: user.image, // Include image if you have it
    // You might want to re-populate other fields if they are affected by the update
    // For simplicity, we are only returning the basic updated fields here.
  });
});
