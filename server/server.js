import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import exploreRoutes from './routes/exploreRoutes.js';
import postRoutes from './routes/postRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import commentRoutes from './routes/commentRoutes.js'

// Load env variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS for frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // your frontend URL
    credentials: true, // allow cookies
  })
);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api', commentRoutes); 

// Health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Global error handler
app.use((err, req, res, next) => {
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
