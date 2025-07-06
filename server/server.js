import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet'; 
import compression from 'compression';
import morgan from 'morgan'; 

import userRoutes from './routes/userRoutes.js';
import exploreRoutes from './routes/exploreRoutes.js';
import postRoutes from './routes/postRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

dotenv.config();

const app = express();

if (process.env.NODE_ENV === 'production') {
  console.log('Running in PRODUCTION mode');

  app.use(helmet());

  app.use(compression());

  app.use(morgan('combined'));
} else {
  console.log('Running in DEVELOPMENT mode');
  app.use(morgan('dev')); 
}


app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true, 
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

app.use('/api/users', userRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api', commentRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use((err, req, res, next) => {
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
  });
}
export default app;
