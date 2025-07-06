import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env file");
}

// Generate JWT
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'none',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
