import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
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
  const user = await User.findById(req.user.id).select('-passwordHash');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json(user);
});

// @desc    Logout user (clear cookie)
// @route   POST /api/users/logout
export const logout = (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.status(200).json({ message: 'Logged out successfully' });
};
