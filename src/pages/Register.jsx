
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useToast } from '../components/ui/use-toast'
import { Button } from '../components/ui/button'
import { store } from '../lib/store'

function Register() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    workShift: 'Mañana',
    profileImage: null
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Error de registro",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error de registro",
        description: "El formato del correo electrónico no es válido",
        variant: "destructive",
      })
      return
    }

    const phoneRegex = /^\d{9}$/
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Error de registro",
        description: "El teléfono debe tener 9 dígitos",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error de registro",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return
    }

    // Verificar si el usuario ya existe
    const existingUser = store.getUser(formData.email)
    if (existingUser) {
      toast({
        title: "Error de registro",
        description: "Este correo electrónico ya está registrado",
        variant: "destructive",
      })
      return
    }

    // Crear nuevo usuario
    const newUser = {
      id: `user-${Date.now()}`,
      profileImage: '',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      registrationDate: new Date().toISOString().split('T')[0],
      role: 'Agente',
      groups: [],
      offices: [],
      workShift: formData.workShift,
      status: 'Activo'
    }

    // Guardar usuario
    store.addUser(newUser)

    toast({
      title: "Registro exitoso",
      description: "Tu cuenta ha sido creada. Por favor, inicia sesión.",
    })

    setTimeout(() => {
      navigate('/login')
    }, 2000)
  }

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
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
          src="https://iberdesarrollos.es/wp-content/uploads/2025/02/Iberdes-Whatsapp.png"
          alt="IberChat Logo"
          className="auth-logo"
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="file"
              name="profileImage"
              accept="image/*"
              className="auth-input"
              onChange={handleInputChange}
            />
          </div>

          <div>
            <input
              type="text"
              name="name"
              placeholder="Nombre completo"
              className="auth-input"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              className="auth-input"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <input
              type="tel"
              name="phone"
              placeholder="Teléfono (9 dígitos)"
              className="auth-input"
              value={formData.phone}
              onChange={handleInputChange}
              maxLength="9"
            />
          </div>

          <div>
            <select
              name="workShift"
              className="auth-input"
              value={formData.workShift}
              onChange={handleInputChange}
            >
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
              <option value="Completa">Jornada Completa</option>
            </select>
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              className="auth-input"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              className="auth-input"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>

          <Button 
            type="submit" 
            className="auth-button-primary"
          >
            Registrarme
          </Button>

          <Button
            type="button"
            className="auth-button-secondary"
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </Button>
        </form>

        <div className="auth-footer">
          Hecho con amor por Emex
        </div>
      </motion.div>
    </div>
  )
}

export default Register
