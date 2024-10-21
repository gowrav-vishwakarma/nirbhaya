import { boot } from 'quasar/wrappers';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export default boot(({ app }) => {
  const API_BASE_URL = process.env.API_BASE_URL;

  console.log('Attempting to connect to WebSocket');
  socket = io(`${API_BASE_URL}/sos`, {
    autoConnect: true,
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
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
    if (reason === 'io server disconnect') {
      socket?.connect();
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Reconnected to WebSocket after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(
      'Attempting to reconnect to WebSocket. Attempt:',
      attemptNumber
    );
  });

  socket.on('reconnect_error', (error) => {
    console.error('Reconnection error:', error);
  });

  socket.on('reconnect_failed', () => {
    console.error('Failed to reconnect to WebSocket after maximum attempts');
  });

  app.config.globalProperties.$socket = socket;
});

export { socket };
