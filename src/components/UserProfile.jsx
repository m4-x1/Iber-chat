
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './ui/use-toast'
import { store } from '../lib/store'

function UserProfile() {
  const { currentUser, setCurrentUser } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    workShift: currentUser.workShift,
    profileImage: currentUser.profileImage
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validaciones
    const phoneRegex = /^\d{9}$/
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Error",
        description: "El teléfono debe tener 9 dígitos",
        variant: "destructive",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "El formato del correo electrónico no es válido",
        variant: "destructive",
      })
      return
    }

    try {
      // Actualizar usuario
      const success = store.updateUser(currentUser.email, formData)
      
      if (success) {
        // Actualizar el usuario actual en el contexto
        setCurrentUser({ ...currentUser, ...formData })
        
        toast({
          title: "Perfil actualizado",
          description: "Los cambios han sido guardados correctamente.",
        })
      } else {
        throw new Error("No se pudieron guardar los cambios")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageData = reader.result
        setFormData(prev => ({
          ...prev,
          profileImage: imageData
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="flex items-center space-x-4 mb-8">
        <Avatar className="w-20 h-20">
          <AvatarImage src={formData.profileImage} />
          <AvatarFallback>{formData.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{formData.name}</h2>
          <p className="text-muted-foreground">{currentUser.role}</p>
          {currentUser.role !== 'God' && (
            <p className="text-sm text-muted-foreground">
              Oficina: {currentUser.office || 'Sin asignar'}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Imagen de perfil</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Correo electrónico</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              maxLength="9"
              className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Jornada</label>
            <select
              value={formData.workShift}
              onChange={(e) => setFormData(prev => ({ ...prev, workShift: e.target.value }))}
              className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
            >
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
              <option value="Completa">Completa</option>
            </select>
          </div>
        </div>

        <Button type="submit" className="w-full">
          Guardar cambios
        </Button>
      </form>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-medium">Información adicional</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Fecha de registro</p>
            <p>{currentUser.registrationDate}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Estado</p>
            <p>{currentUser.status}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Grupos</p>
            <p>{currentUser.groups?.length || 0}</p>
          </div>
          {currentUser.role !== 'God' && (
            <div>
              <p className="text-muted-foreground">Oficina</p>
              <p>{currentUser.office || 'Sin asignar'}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default UserProfile
