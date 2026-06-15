import { io } from 'socket.io-client';
import { API_BASE_URL } from '../constants/config';

const socket = io(API_BASE_URL, {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
});

export default socket;
