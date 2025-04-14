
import { io } from 'socket.io-client';
import { store } from '@/lib/store';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.messageHandlers = new Set();
    this.notificationHandlers = new Set();
  }

  connect(userId) {
    this.socket = io('wss://chat.iberdesarrollos.es', {
      query: { userId }
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('message', (message) => {
      // Guardar el mensaje en el almacenamiento local
      store.addMessage(message);

      // Notificar a todos los manejadores registrados
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('notification', (notification) => {
      this.notificationHandlers.forEach(handler => handler(notification));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(message) {
    if (this.socket) {
      this.socket.emit('message', message);
    }
  }

  onMessage(handler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onNotification(handler) {
    this.notificationHandlers.add(handler);
    return () => this.notificationHandlers.delete(handler);
  }
}

export const websocketService = new WebSocketService();
