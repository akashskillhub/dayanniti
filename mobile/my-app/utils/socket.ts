import { io } from 'socket.io-client';
import { API_BASE_URL } from '../constants/config';

const socket = io(API_BASE_URL, {
  transports: ['websocket'],
});

export default socket;
