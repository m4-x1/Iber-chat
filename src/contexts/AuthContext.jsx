
import React, { createContext, useContext, useState, useEffect } from 'react'
import { store } from '../lib/store'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail')
    const savedPassword = localStorage.getItem('userPassword')
    
    if (savedEmail && savedPassword) {
      const user = store.getUser(savedEmail)
      if (user && user.password === savedPassword) {
        setCurrentUser(user)
      }
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    const user = store.getUser(email)
    if (user && user.password === password) {
      setCurrentUser(user)
      return true
    }
    return false
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userPassword')
  }

  const value = {
    currentUser,
    setCurrentUser,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
