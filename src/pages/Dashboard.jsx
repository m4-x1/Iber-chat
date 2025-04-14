
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { MessageSquare, Building2, Users, User, Settings as SettingsIcon, Sun, Moon, LogOut, Plus, UserPlus, Group as UserGroup } from 'lucide-react'
import ChatList from '../components/ChatList'
import ChatWindow from '../components/ChatWindow'
import UserProfile from '../components/UserProfile'
import Settings from '../components/Settings'
import OfficeManagement from '../components/OfficeManagement'
import UserManagement from '../components/UserManagement'
import GroupManagement from '../components/GroupManagement'
import { Button } from '../components/ui/button'
import { store } from '../lib/store'
import { useToast } from '../components/ui/use-toast'

function Dashboard() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const { currentUser, logout } = useAuth()
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState('chats')
  const [selectedChat, setSelectedChat] = useState(null)
  const [chats, setChats] = useState([])

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    loadChats()
  }, [currentUser, navigate])

  const loadChats = () => {
    const userChats = store.getChatsByUser(currentUser.id)
    setChats(userChats.map(chat => {
      const otherParticipant = store.getUsers().find(
        user => user.id === chat.participants.find(id => id !== currentUser.id)
      )
      return {
        ...chat,
        name: chat.type === 'group' ? chat.name : (otherParticipant?.name || 'Usuario desconocido'),
        image: chat.type === 'group' ? chat.image : (otherParticipant?.profileImage || ''),
        status: otherParticipant?.status || 'Desconectado',
        unreadCount: store.getUnreadCount(chat.id, currentUser.id)
      }
    }))
  }

  if (!currentUser) {
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNewChat = (userId) => {
    try {
      const newChat = {
        id: `chat-${Date.now()}`,
        participants: [currentUser.id, userId],
        createdAt: new Date().toISOString(),
        lastMessage: ''
      }
      store.addChat(newChat)
      loadChats()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'chats':
        return (
          <div className="flex h-full">
            <div className="w-1/3 border-r border-border">
              <ChatList
                chats={chats}
                onSelect={setSelectedChat}
                selectedId={selectedChat?.id}
                onNewChat={handleNewChat}
                onChatDeleted={loadChats}
              />
            </div>
            <div className="w-2/3">
              <ChatWindow
                chat={selectedChat}
                onSendMessage={() => loadChats()}
              />
            </div>
          </div>
        )
      case 'groups':
        return (
          <div className="flex h-full">
            <div className="w-1/3 border-r border-border">
              <GroupManagement 
                onSelectChat={(chat) => {
                  setSelectedChat(chat)
                  setActiveSection('chats')
                }}
              />
            </div>
            <div className="w-2/3">
              <ChatWindow
                chat={selectedChat}
                onSendMessage={() => loadChats()}
              />
            </div>
          </div>
        )
      case 'offices':
        return <OfficeManagement />
      case 'users':
        return <UserManagement />
      case 'profile':
        return <UserProfile />
      case 'settings':
        return <Settings />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-20 border-r border-border p-4 flex flex-col items-center justify-between">
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="icon"
            className={activeSection === 'chats' ? 'bg-accent' : ''}
            onClick={() => setActiveSection('chats')}
          >
            <MessageSquare className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={activeSection === 'groups' ? 'bg-accent' : ''}
            onClick={() => setActiveSection('groups')}
          >
            <UserGroup className="w-5 h-5" />
          </Button>

          {currentUser.role !== 'Agente' && (
            <Button
              variant="ghost"
              size="icon"
              className={activeSection === 'offices' ? 'bg-accent' : ''}
              onClick={() => setActiveSection('offices')}
            >
              <Building2 className="w-5 h-5" />
            </Button>
          )}

          {currentUser.role === 'God' && (
            <Button
              variant="ghost"
              size="icon"
              className={activeSection === 'users' ? 'bg-accent' : ''}
              onClick={() => setActiveSection('users')}
            >
              <Users className="w-5 h-5" />
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <Button
            variant="ghost"
            size="icon"
            className={activeSection === 'profile' ? 'bg-accent' : ''}
            onClick={() => setActiveSection('profile')}
          >
            <User className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={activeSection === 'settings' ? 'bg-accent' : ''}
            onClick={() => setActiveSection('settings')}
          >
            <SettingsIcon className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  )
}

export default Dashboard
