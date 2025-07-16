import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import http from 'http'; // Import http module
import { Server } from 'socket.io'; // Import Server from socket.io

// Import routes
import userRoutes from './routes/userRoutes.js';
import exploreRoutes from './routes/exploreRoutes.js';
import postRoutes from './routes/postRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js'; // Import notification routes

dotenv.config();

const app = express();
const server = http.createServer(app); // Create an HTTP server from the Express app

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Allow connections from your frontend URL
    methods: ["GET", "POST"], // Allowed HTTP methods for CORS
    credentials: true // Allow sending cookies/auth headers
  }
});

const connectedUsers = new Map(); 

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('register', (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ID: ${socket.id}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} unregistered.`);
        break;
      }
    }
  });
});

// Export the io instance so it can be used in other modules (e.g., controllers)
export { io, connectedUsers };

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

// Mount your API routes
app.use('/api/users', userRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api', commentRoutes);
app.use('/api/notifications', notificationRoutes); // Add notification routes

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Listen on the HTTP server, not the Express app directly
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`⚡ Socket.IO server running on port ${PORT}`);
});
