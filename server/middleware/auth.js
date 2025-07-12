import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import { verifyToken } from '../utils/token.js'; // Assuming this correctly verifies JWT

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = verifyToken(token);

      const user = await User.findById(decoded.id).select('-passwordHash');

      if (!user) {
        res.status(401);
        throw new Error('Unauthorized: User not found from token');
      }

      req.user = user; 
      next(); 
    } catch (err) {
      console.error(err); 
      res.status(401);
      throw new Error('Unauthorized: Invalid or expired token');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Unauthorized: No token provided in Authorization header');
  }
});