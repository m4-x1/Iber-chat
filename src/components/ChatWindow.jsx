
import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useAuth } from '../contexts/AuthContext'
import { useWebSocket } from '../contexts/WebSocketContext'
import { store } from '../lib/store'
import MessageStatus from './MessageStatus'

function ChatWindow({ chat, onSendMessage }) {
  const { currentUser } = useAuth()
  const websocket = useWebSocket()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (chat) {
      const chatMessages = store.getMessages()
        .filter(msg => msg.chatId === chat.id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      setMessages(chatMessages)
      
      // Marcar mensajes como leídos
      store.markAsRead(chat.id, currentUser.id)
      
      setTimeout(scrollToBottom, 100)
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }

    // Suscribirse a nuevos mensajes
    const handleNewMessage = (event) => {
      const newMessage = event.detail;
      if (newMessage.chatId === chat?.id) {
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
        store.markAsRead(chat.id, currentUser.id);
      }
    };

    window.addEventListener('newMessage', handleNewMessage);
    return () => window.removeEventListener('newMessage', handleNewMessage);
  }, [chat, currentUser.id])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      const newMessage = {
        id: `msg-${Date.now()}`,
        chatId: chat.id,
        text: message,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        senderId: currentUser.id,
        receiverId: chat.participants.find(id => id !== currentUser.id),
        status: 'sent',
        createdAt: new Date().toISOString()
      }

      // Enviar mensaje a través de WebSocket
      websocket.sendMessage(newMessage);

      store.addMessage(newMessage)
      setMessages(prev => [...prev, newMessage])
      setMessage('')
      scrollToBottom()
      onSendMessage(newMessage)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (!chat) return null

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center space-x-4 p-4 border-b border-border bg-card">
        <Avatar>
          <AvatarImage src={chat.image} />
          <AvatarFallback>
            {chat.name ? (
              chat.name.charAt(0).toUpperCase()
            ) : (
              <User className="h-6 w-6" />
            )}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium">{chat.name || 'Usuario desconocido'}</h2>
          <p className="text-sm text-muted-foreground">{chat.status || 'En línea'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col justify-start min-h-full p-4 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.senderId === currentUser.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <div className="flex items-center justify-end space-x-1 mt-1">
                  <span className="text-xs opacity-70">{msg.time}</span>
                  {msg.senderId === currentUser.id && (
                    <MessageStatus status={msg.status} />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t border-border">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-background rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatWindow
