import { io } from 'socket.io-client';

const URL = 'https://iidx-stream-request.onrender.com/';

export const socket = io(URL);