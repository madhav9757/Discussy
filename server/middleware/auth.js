import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401);
    throw new Error('Unauthorized: No token');
  }

  try {
    const decoded = verifyToken(token); 

    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      res.status(401);
      throw new Error('Unauthorized: User not found');
    }

    req.user = user; 
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Unauthorized: Invalid token');
  }
});
