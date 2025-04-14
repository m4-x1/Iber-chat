
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { User, Search, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { store } from '@/lib/store'
import { Button } from './ui/button'
import { useToast } from './ui/use-toast'

function ChatList({ chats = [], onSelect, selectedId, onNewChat }) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOffice, setSelectedOffice] = useState('')

  const offices = currentUser.role === 'God' ? store.getOffices() : 
    currentUser.role === 'Admin' ? store.getOfficesByAdmin(currentUser.id) : []

  const availableUsers = store.getUsers().filter(user => 
    user.id !== currentUser.id && !store.chatExists(currentUser.id, user.id)
  )

  const sortedChats = [...chats].sort((a, b) => {
    const aMessages = store.getMessages().filter(m => m.chatId === a.id)
    const bMessages = store.getMessages().filter(m => m.chatId === b.id)
    const aLastMessage = aMessages[aMessages.length - 1]
    const bLastMessage = bMessages[bMessages.length - 1]
    return new Date(bLastMessage?.createdAt || 0) - new Date(aLastMessage?.createdAt || 0)
  })

  const filteredChats = sortedChats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesOffice = !selectedOffice || chat.officeId === selectedOffice
    return matchesSearch && matchesOffice
  })

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation()
    if (currentUser.role === 'God' || currentUser.role === 'Admin') {
      const chats = JSON.parse(localStorage.getItem('chats') || '[]')
      const messages = JSON.parse(localStorage.getItem('messages') || '[]')
      
      const updatedMessages = messages.filter(msg => msg.chatId !== chatId)
      localStorage.setItem('messages', JSON.stringify(updatedMessages))
      
      const updatedChats = chats.filter(chat => chat.id !== chatId)
      localStorage.setItem('chats', JSON.stringify(updatedChats))
      
      toast({
        title: "Chat eliminado",
        description: "El chat ha sido eliminado correctamente"
      })
      
      window.location.reload()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          {(currentUser.role === 'God' || currentUser.role === 'Admin') && (
            <>
              <select
                value={selectedOffice}
                onChange={(e) => setSelectedOffice(e.target.value)}
                className="w-1/2 px-4 py-2 rounded-md border border-border bg-accent/50"
              >
                <option value="">Todas las oficinas</option>
                {offices.map(office => (
                  <option key={office.id} value={office.id}>
                    {office.name}
                  </option>
                ))}
              </select>

              <Button
                onClick={() => {
                  const dialog = document.createElement('div')
                  dialog.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50'
                  dialog.innerHTML = `
                    <div class="bg-background p-4 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
                      <h3 class="text-lg font-medium mb-4">Nuevo Chat</h3>
                      <div class="space-y-2">
                        ${availableUsers.map(user => `
                          <div class="flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-accent"
                               onclick="this.closest('.fixed').remove(); window.startNewChat('${user.id}')">
                            <div class="flex-1">
                              <p class="font-medium">${user.name}</p>
                              <p class="text-sm text-muted-foreground">${user.email}</p>
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  `
                  document.body.appendChild(dialog)
                  dialog.onclick = e => {
                    if (e.target === dialog) dialog.remove()
                  }
                  window.startNewChat = userId => onNewChat(userId)
                }}
                className="w-1/2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Chat
              </Button>
            </>
          )}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-md border border-border bg-accent/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-4">
          {filteredChats.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelect(chat)}
              className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors
                ${selectedId === chat.id ? 'bg-accent' : 'hover:bg-accent/50'}`}
            >
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
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-bold' : 'font-medium'}`}>
                  {chat.name || 'Usuario desconocido'}
                </p>
                <p className={`text-xs text-muted-foreground truncate ${chat.unreadCount > 0 ? 'font-semibold' : ''}`}>
                  {chat.lastMessage || 'No hay mensajes'}
                </p>
              </div>
              {chat.unreadCount > 0 && (
                <div className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                  {chat.unreadCount}
                </div>
              )}
              {(currentUser.role === 'God' || currentUser.role === 'Admin') && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive ml-2"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          ))}
          {filteredChats.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No hay chats disponibles
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatList
