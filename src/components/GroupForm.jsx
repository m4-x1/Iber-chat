
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { store } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

function GroupForm({ initialData, onSubmit, onCancel, selectedOffice, offices, isGod }) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    members: [],
    officeId: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        image: initialData.image,
        members: initialData.members.filter(id => id !== currentUser.id),
        officeId: initialData.officeId
      })
    } else {
      setFormData({
        name: '',
        image: '',
        members: [],
        officeId: selectedOffice || (currentUser.role === 'Admin' ? store.getOfficesByAdmin(currentUser.id)[0]?.id : '')
      })
    }
  }, [initialData, currentUser.id, selectedOffice])

  const getAvailableUsers = () => {
    const users = store.getUsers()
    if (currentUser.role === 'God') {
      return users.filter(user => user.id !== currentUser.id)
    } else if (currentUser.role === 'Admin') {
      const userOffice = store.getOfficesByAdmin(currentUser.id)[0]
      return users.filter(user => 
        user.id !== currentUser.id && 
        userOffice?.users.includes(user.id)
      )
    }
    return []
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.officeId && isGod) {
      toast({
        title: "Error",
        description: "Debe seleccionar una oficina",
        variant: "destructive",
      })
      return
    }

    if (formData.members.length < 2) {
      toast({
        title: "Error",
        description: "Un grupo debe tener al menos 3 miembros (incluyéndote)",
        variant: "destructive",
      })
      return
    }

    const groupData = {
      ...formData,
      members: [...formData.members, currentUser.id]
    }

    onSubmit(groupData)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isGod && (
          <div>
            <label className="block text-sm font-medium mb-1">Oficina</label>
            <select
              value={formData.officeId}
              onChange={(e) => setFormData(prev => ({ ...prev, officeId: e.target.value }))}
              className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
              required
            >
              <option value="">Seleccionar oficina</option>
              {offices.map(office => (
                <option key={office.id} value={office.id}>
                  {office.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Nombre del grupo</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Imagen del grupo</label>
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
          <label className="block text-sm font-medium mb-1">Miembros</label>
          <div className="max-h-48 overflow-y-auto border border-border rounded-md p-2">
            {getAvailableUsers().map(user => (
              <label key={user.id} className="flex items-center space-x-2 p-2 hover:bg-accent/50 rounded">
                <input
                  type="checkbox"
                  checked={formData.members.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        members: [...prev.members, user.id]
                      }))
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        members: prev.members.filter(id => id !== user.id)
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
            {initialData ? 'Guardar cambios' : 'Crear grupo'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

export default GroupForm
