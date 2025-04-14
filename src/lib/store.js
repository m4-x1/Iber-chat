
import { useToast } from '@/components/ui/use-toast'

// [Previous initialization code remains the same until line 54]

export const store = {
  // Users
  getUsers: () => JSON.parse(localStorage.getItem('users') || '[]'),
  getUser: (email) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    return users.find(user => user.email === email)
  },
  addUser: (user) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    users.push(user)
    localStorage.setItem('users', JSON.stringify(users))
  },
  updateUser: (email, userData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const index = users.findIndex(user => user.email === email)
    if (index !== -1) {
      users[index] = { 
        ...users[index], 
        ...userData,
        password: userData.password || users[index].password
      }
      localStorage.setItem('users', JSON.stringify(users))
      return true
    }
    return false
  },
  deleteUser: (userId) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const filteredUsers = users.filter(user => user.id !== userId)
    localStorage.setItem('users', JSON.stringify(filteredUsers))
  },

  // Offices
  getOffices: () => JSON.parse(localStorage.getItem('offices') || '[]'),
  getOfficesByAdmin: (adminId) => {
    const offices = JSON.parse(localStorage.getItem('offices') || '[]')
    return offices.filter(office => 
      office.admins.includes(adminId)
    )
  },
  addOffice: (office) => {
    const offices = JSON.parse(localStorage.getItem('offices') || '[]')
    const existingOffice = offices.find(o => o.name.toLowerCase() === office.name.toLowerCase())
    if (existingOffice) {
      throw new Error('Ya existe una oficina con este nombre')
    }
    offices.push(office)
    localStorage.setItem('offices', JSON.stringify(offices))
  },
  updateOffice: (officeId, officeData) => {
    const offices = JSON.parse(localStorage.getItem('offices') || '[]')
    const index = offices.findIndex(office => office.id === officeId)
    if (index !== -1) {
      offices[index] = { ...offices[index], ...officeData }
      localStorage.setItem('offices', JSON.stringify(offices))
      return true
    }
    return false
  },
  deleteOffice: (officeId) => {
    const offices = JSON.parse(localStorage.getItem('offices') || '[]')
    const filteredOffices = offices.filter(office => office.id !== officeId)
    localStorage.setItem('offices', JSON.stringify(filteredOffices))
  },

  // Groups
  getGroups: () => JSON.parse(localStorage.getItem('groups') || '[]'),
  getGroupsByOffice: (officeId) => {
    const groups = JSON.parse(localStorage.getItem('groups') || '[]')
    return groups.filter(group => group.officeId === officeId)
  },
  addGroup: (group) => {
    const groups = JSON.parse(localStorage.getItem('groups') || '[]')
    const office = store.getOffices().find(o => o.id === group.officeId)
    
    if (office) {
      const existingGroup = groups.find(g => 
        g.name.toLowerCase() === group.name.toLowerCase() && 
        g.officeId === group.officeId
      )
      if (existingGroup) {
        throw new Error('Ya existe un grupo con este nombre en esta oficina')
      }
    }
    
    if (group.members.length < 3) {
      throw new Error('Un grupo debe tener al menos 3 miembros')
    }
    
    const newGroup = {
      ...group,
      chatId: `chat-${Date.now()}`
    }
    
    groups.push(newGroup)
    localStorage.setItem('groups', JSON.stringify(groups))
    
    // Create a chat for the group
    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    chats.push({
      id: newGroup.chatId,
      type: 'group',
      groupId: newGroup.id,
      name: newGroup.name,
      image: newGroup.image,
      participants: newGroup.members,
      createdAt: new Date().toISOString(),
      lastMessage: ''
    })
    localStorage.setItem('chats', JSON.stringify(chats))
    
    return newGroup
  },
  updateGroup: (groupId, groupData) => {
    const groups = JSON.parse(localStorage.getItem('groups') || '[]')
    const index = groups.findIndex(group => group.id === groupId)
    if (index !== -1) {
      groups[index] = { ...groups[index], ...groupData }
      localStorage.setItem('groups', JSON.stringify(groups))
      
      // Update chat if members changed
      if (groupData.members) {
        const chats = JSON.parse(localStorage.getItem('chats') || '[]')
        const chatIndex = chats.findIndex(chat => chat.groupId === groupId)
        if (chatIndex !== -1) {
          chats[chatIndex] = {
            ...chats[chatIndex],
            participants: groupData.members,
            name: groupData.name || chats[chatIndex].name,
            image: groupData.image || chats[chatIndex].image
          }
          localStorage.setItem('chats', JSON.stringify(chats))
        }
      }
      
      return groups[index]
    }
    return null
  },
  deleteGroup: (groupId) => {
    const groups = JSON.parse(localStorage.getItem('groups') || '[]')
    const group = groups.find(g => g.id === groupId)
    if (group) {
      // Delete group messages
      const messages = JSON.parse(localStorage.getItem('messages') || '[]')
      const filteredMessages = messages.filter(m => m.chatId !== group.chatId)
      localStorage.setItem('messages', JSON.stringify(filteredMessages))
      
      // Delete group chat
      const chats = JSON.parse(localStorage.getItem('chats') || '[]')
      const filteredChats = chats.filter(c => c.id !== group.chatId)
      localStorage.setItem('chats', JSON.stringify(filteredChats))
      
      // Delete group
      const filteredGroups = groups.filter(g => g.id !== groupId)
      localStorage.setItem('groups', JSON.stringify(filteredGroups))
    }
  },

  // Chats
  getChats: () => JSON.parse(localStorage.getItem('chats') || '[]'),
  getChatsByUser: (userId) => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    return chats.filter(chat => chat.participants.includes(userId))
  },
  chatExists: (user1Id, user2Id) => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    return chats.some(chat => 
      chat.type !== 'group' &&
      chat.participants.includes(user1Id) && 
      chat.participants.includes(user2Id)
    )
  },
  addChat: (chat) => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    if (store.chatExists(chat.participants[0], chat.participants[1])) {
      throw new Error('Ya existe un chat entre estos usuarios')
    }
    const newChat = {
      ...chat,
      type: 'individual'
    }
    chats.push(newChat)
    localStorage.setItem('chats', JSON.stringify(chats))
    return newChat
  },

  // Messages
  getMessages: () => JSON.parse(localStorage.getItem('messages') || '[]'),
  getUnreadCount: (chatId, userId) => {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]')
    const readMessages = JSON.parse(localStorage.getItem('readMessages') || '{}')
    
    const lastRead = readMessages[`${chatId}-${userId}`] || 0
    return messages.filter(msg => 
      msg.chatId === chatId && 
      msg.senderId !== userId && 
      new Date(msg.createdAt) > new Date(lastRead)
    ).length
  },
  markAsRead: (chatId, userId) => {
    const readMessages = JSON.parse(localStorage.getItem('readMessages') || '{}')
    readMessages[`${chatId}-${userId}`] = new Date().toISOString()
    localStorage.setItem('readMessages', JSON.stringify(readMessages))
  },
  addMessage: (message) => {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]')
    messages.push(message)
    localStorage.setItem('messages', JSON.stringify(messages))
    
    // Update last message in chat
    const chats = JSON.parse(localStorage.getItem('chats') || '[]')
    const chatIndex = chats.findIndex(chat => chat.id === message.chatId)
    if (chatIndex !== -1) {
      chats[chatIndex].lastMessage = message.text
      localStorage.setItem('chats', JSON.stringify(chats))
    }
    
    return message
  }
}
