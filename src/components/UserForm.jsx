
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { store } from '@/lib/store'

function UserForm({ initialData, onSubmit, onCancel }) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    password: '',
    role: initialData?.role || 'Agente',
    workShift: initialData?.workShift || 'Completa',
    profileImage: initialData?.profileImage || '',
    office: initialData?.office || ''
  })

  const [offices] = useState(store.getOffices())

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        password: ''
      })
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.phone || !formData.office) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    if (!initialData && !formData.password) {
      toast({
        title: "Error",
        description: "La contraseña es obligatoria para nuevos usuarios",
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

    const phoneRegex = /^\d{9}$/
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Error",
        description: "El teléfono debe tener 9 dígitos",
        variant: "destructive",
      })
      return
    }

    if (!initialData && formData.password.length < 8) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive",
      })
      return
    }

    const office = offices.find(o => o.name === formData.office)
    if (!office) {
      toast({
        title: "Error",
        description: "La oficina seleccionada no existe",
        variant: "destructive",
      })
      return
    }

    onSubmit({
      ...formData,
      officeId: office.id
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profileImage: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className="block text-sm font-medium mb-1">Nombre completo</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Correo electrónico</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
            required
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
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Oficina</label>
          <input
            type="text"
            value={formData.office}
            onChange={(e) => setFormData(prev => ({ ...prev, office: e.target.value }))}
            className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
            required
            list="offices"
          />
          <datalist id="offices">
            {offices.map(office => (
              <option key={office.id} value={office.name} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rol</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
          >
            <option value="Agente">Agente</option>
            <option value="Admin">Admin</option>
            <option value="God">God</option>
          </select>
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

        <div>
          <label className="block text-sm font-medium mb-1">
            {initialData ? 'Nueva contraseña (dejar en blanco para mantener la actual)' : 'Contraseña'}
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
            required={!initialData}
          />
        </div>

        <div className="flex space-x-2">
          <Button type="submit" className="flex-1">
            {initialData ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

export default UserForm
