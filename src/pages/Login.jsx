
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useToast } from '../components/ui/use-toast'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { login, currentUser } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard')
    }

    const savedEmail = localStorage.getItem('userEmail')
    const savedPassword = localStorage.getItem('userPassword')
    
    if (savedEmail && savedPassword) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        password: savedPassword,
        rememberMe: true
      }))
    }
  }, [currentUser, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Reset errors
    setErrors({
      email: '',
      password: ''
    })

    // Validate email/phone
    if (!formData.email) {
      setErrors(prev => ({
        ...prev,
        email: 'El correo electrónico o teléfono es obligatorio'
      }))
      return
    }

    // Validate password
    if (!formData.password) {
      setErrors(prev => ({
        ...prev,
        password: 'La contraseña es obligatoria'
      }))
      return
    }
    
    const success = login(formData.email, formData.password)
    
    if (success) {
      if (formData.rememberMe) {
        localStorage.setItem('userEmail', formData.email)
        localStorage.setItem('userPassword', formData.password)
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de nuevo!",
      })

      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } else {
      toast({
        title: "Error de inicio de sesión",
        description: "Credenciales incorrectas",
        variant: "destructive",
      })

      setErrors({
        email: 'Credenciales incorrectas',
        password: 'Credenciales incorrectas'
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="auth-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-form"
      >
        <img
          src="https://iberdesarrollos.es/wp-content/uploads/2025/04/Iberdes-Whatsapp-1.png"
          alt="IberChat Logo"
          className="auth-logo"
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="email"
              placeholder="Correo electrónico o teléfono"
              className={`auth-input ${errors.email ? 'border-destructive' : ''}`}
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              className={`auth-input ${errors.password ? 'border-destructive' : ''}`}
              value={formData.password}
              onChange={handleInputChange}
            />
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password}</p>
            )}
          </div>

          <div className="remember-me">
            <input
              type="checkbox"
              name="rememberMe"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="rounded bg-black/50 border-primary/20 text-primary focus:ring-primary"
            />
            <label htmlFor="rememberMe">Recordar en este dispositivo</label>
          </div>

          <Button 
            type="submit" 
            className="auth-button-primary"
          >
            Iniciar sesión
          </Button>

          <Button
            type="button"
            className="auth-button-secondary"
            onClick={() => navigate('/register')}
          >
            Registrarme
          </Button>
        </form>

        <div className="auth-footer">
          Hecho con amor por Emex
        </div>
      </motion.div>
    </div>
  )
}

export default Login
