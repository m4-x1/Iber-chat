
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { store } from '@/lib/store'
import OfficeForm from './OfficeForm'

function OfficeManagement() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [offices, setOffices] = useState([])
  const [selectedOffice, setSelectedOffice] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState('add')

  useEffect(() => {
    if (currentUser.role === 'God') {
      setOffices(store.getOffices())
    } else if (currentUser.role === 'Admin') {
      setOffices(store.getOfficesByAdmin(currentUser.id))
    }
  }, [currentUser])

  const handleAddOffice = (officeData) => {
    try {
      store.addOffice({
        id: `office-${Date.now()}`,
        ...officeData,
        createdAt: new Date().toISOString()
      })
      
      setOffices(store.getOffices())
      setIsDialogOpen(false)
      toast({
        title: "Oficina creada",
        description: "La oficina ha sido creada correctamente",
      })
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleEditOffice = (officeData) => {
    try {
      store.updateOffice(selectedOffice.id, officeData)
      if (currentUser.role === 'God') {
        setOffices(store.getOffices())
      } else {
        setOffices(store.getOfficesByAdmin(currentUser.id))
      }
      setIsDialogOpen(false)
      setSelectedOffice(null)
      toast({
        title: "Oficina actualizada",
        description: "Los cambios han sido guardados correctamente",
      })
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteOffice = (office) => {
    try {
      // Eliminar la oficina
      store.deleteOffice(office.id)
      if (currentUser.role === 'God') {
        setOffices(store.getOffices())
      } else {
        setOffices(store.getOfficesByAdmin(currentUser.id))
      }
      toast({
        title: "Oficina eliminada",
        description: "La oficina ha sido eliminada correctamente",
      })
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Vista para usuario Admin
  if (currentUser.role === 'Admin') {
    const office = offices[0] // Admin solo puede ver su oficina
    if (!office) return <div className="p-6">No tienes ninguna oficina asignada</div>

    return (
      <div className="p-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={office.image} />
              <AvatarFallback>{office.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{office.name}</h2>
              <p className="text-muted-foreground">{office.address}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Administradores</h3>
              <div className="grid gap-2">
                {office.admins.map(adminId => {
                  const admin = store.getUsers().find(u => u.id === adminId)
                  return (
                    <div key={adminId} className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={admin?.profileImage} />
                        <AvatarFallback>{admin?.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{admin?.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Usuarios</h3>
              <div className="grid gap-2">
                {office.users.map(userId => {
                  const user = store.getUsers().find(u => u.id === userId)
                  return (
                    <div key={userId} className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.profileImage} />
                        <AvatarFallback>{user?.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{user?.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Vista para usuario God
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Oficinas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setDialogMode('add')
                setSelectedOffice(null)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Oficina
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'add' ? 'Agregar Oficina' : 'Editar Oficina'}
              </DialogTitle>
            </DialogHeader>
            <OfficeForm
              initialData={selectedOffice}
              onSubmit={dialogMode === 'add' ? handleAddOffice : handleEditOffice}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {offices.map(office => (
          <motion.div
            key={office.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={office.image} />
                <AvatarFallback>{office.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{office.name}</h3>
                <p className="text-sm text-muted-foreground">{office.address}</p>
                <p className="text-xs text-muted-foreground">
                  {office.users.length} usuarios · {office.admins.length} administradores
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedOffice(office)
                  setDialogMode('edit')
                  setIsDialogOpen(true)
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => handleDeleteOffice(office)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default OfficeManagement
