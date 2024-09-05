import { boot } from 'quasar/wrappers';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export default boot(({ app }) => {
  const API_BASE_URL = process.env.API_BASE_URL;

  console.log('Attempting to connect to WebSocket');
  socket = io(`${API_BASE_URL}/sos`, {
    autoConnect: true,
    withCredentials: true,
    transports: ['websocket', 'polling'], // Try WebSocket first, then fallback to polling
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket');
    console.log('Socket ID:', socket?.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from WebSocket. Reason:', reason);
  });

  // Make socket available globally
  app.config.globalProperties.$socket = socket;
});

export { socket };
