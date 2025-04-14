
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { store } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

function OfficeForm({ onSubmit, onCancel }) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    address: '',
    admins: [],
    users: []
  })

  const getAvailableAdmins = () => {
    return store.getUsers().filter(user => 
      user.role === 'Admin' && 
      user.id !== currentUser.id
    )
  }

  const getAvailableUsers = () => {
    return store.getUsers().filter(user => 
      user.role === 'Agente' &&
      !user.office
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (formData.admins.length > 4) {
      toast({
        title: "Error",
        description: "Una oficina no puede tener más de 4 administradores",
        variant: "destructive",
      })
      return
    }

    if (formData.admins.length === 0) {
      toast({
        title: "Error",
        description: "Una oficina debe tener al menos un administrador",
        variant: "destructive",
      })
      return
    }

    onSubmit(formData)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre de la oficina</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Imagen de la oficina</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0]
              if (file) {
                const reader = new FileReader()
                reader.onloadend = () => {
                  setFormData(prev => ({ ...prev, image: reader.result }))
                }
                reader.readAsDataURL(file)
              }
            }}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Administradores</label>
          <div className="max-h-48 overflow-y-auto border border-border rounded-md p-2">
            {getAvailableAdmins().map(admin => (
              <label key={admin.id} className="flex items-center space-x-2 p-2 hover:bg-accent/50 rounded">
                <input
                  type="checkbox"
                  checked={formData.admins.includes(admin.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        admins: [...prev.admins, admin.id]
                      }))
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        admins: prev.admins.filter(id => id !== admin.id)
                      }))
                    }
                  }}
                  className="rounded border-primary/20 text-primary focus:ring-primary"
                />
                <span>{admin.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Usuarios</label>
          <div className="max-h-48 overflow-y-auto border border-border rounded-md p-2">
            {getAvailableUsers().map(user => (
              <label key={user.id} className="flex items-center space-x-2 p-2 hover:bg-accent/50 rounded">
                <input
                  type="checkbox"
                  checked={formData.users.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        users: [...prev.users, user.id]
                      }))
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        users: prev.users.filter(id => id !== user.id)
                      }))
                    }
                  }}
                  className="rounded border-primary/20 text-primary focus:ring-primary"
                />
                <span>{user.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button type="submit" className="flex-1">
            Crear oficina
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

export default OfficeForm
