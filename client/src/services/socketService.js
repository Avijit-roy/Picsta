import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server:', this.socket.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChat(chatId) {
    if (this.socket) {
      this.socket.emit('join_chat', chatId);
    }
  }

  leaveChat(chatId) {
    if (this.socket) {
      this.socket.emit('leave_chat', chatId);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off('new_message');
    }
  }

  onMessagesDeleted(callback) {
    if (this.socket) {
      this.socket.on('messages_deleted', callback);
    }
  }

  offMessagesDeleted() {
    if (this.socket) {
      this.socket.off('messages_deleted');
    }
  }

  onChatUpdated(callback) {
    if (this.socket) {
      this.socket.on('chat_updated', callback);
    }
  }

  offChatUpdated() {
    if (this.socket) {
      this.socket.off('chat_updated');
    }
  }
}

const socketService = new SocketService();
export default socketService;
