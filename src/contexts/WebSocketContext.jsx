
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { websocketService } from '@/services/websocket';
import { useToast } from '@/components/ui/use-toast';

const WebSocketContext = createContext();

export function WebSocketProvider({ children }) {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      websocketService.connect(currentUser.id);

      const unsubscribeMessage = websocketService.onMessage((message) => {
        // Actualizar la interfaz cuando se recibe un mensaje
        window.dispatchEvent(new CustomEvent('newMessage', { detail: message }));
      });

      const unsubscribeNotification = websocketService.onNotification((notification) => {
        toast({
          title: notification.title,
          description: notification.message,
        });
      });

      return () => {
        unsubscribeMessage();
        unsubscribeNotification();
        websocketService.disconnect();
      };
    }
  }, [currentUser]);

  return (
    <WebSocketContext.Provider value={websocketService}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);
