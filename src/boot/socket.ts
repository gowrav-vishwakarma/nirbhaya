import { boot } from 'quasar/wrappers';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export default boot(({ app }) => {
  const API_BASE_URL = 'ws://127.0.0.1:3000/sos';

  socket = io(API_BASE_URL, {
    autoConnect: false,
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket');
  });

  // Make socket available globally
  app.config.globalProperties.$socket = socket;
});

export { socket };
