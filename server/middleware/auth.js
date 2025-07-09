import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import { verifyToken } from '../utils/token.js'; // Assuming this correctly verifies JWT

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in the Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = verifyToken(token);

      // Find the user by the ID from the token
      const user = await User.findById(decoded.id).select('-passwordHash');

      if (!user) {
        res.status(401);
        throw new Error('Unauthorized: User not found from token');
      }

      req.user = user; // Attach the user to the request object
      next(); // Proceed to the route handler
    } catch (err) {
      console.error(err); // Log the actual error for debugging
      res.status(401);
      throw new Error('Unauthorized: Invalid or expired token');
    }
  }

  // If no token was found in the Authorization header
  if (!token) {
    res.status(401);
    throw new Error('Unauthorized: No token provided in Authorization header');
  }
});