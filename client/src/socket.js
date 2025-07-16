import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
  withCredentials: true,
  transports: ['websocket'], // ensures stability
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
