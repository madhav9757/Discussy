import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
  withCredentials: true,
  transports: ['websocket', 'polling'], // Allow both transports
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
});

// Add connection event listeners for debugging
socket.on('connect', () => {
  console.log('🔌 Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('🚨 Socket connection error:', error);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔌 Socket reconnected after', attemptNumber, 'attempts');
});

export default socket;