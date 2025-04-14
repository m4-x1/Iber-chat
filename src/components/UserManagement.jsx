
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { store } from '@/lib/store'
import UserForm from './UserForm'

function UserManagement() {
  const { toast } = useToast()
  const [users, setUsers] = useState(store.getUsers())
  const [selectedUser, setSelectedUser] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState('add') // 'add' or 'edit'

  const handleAddUser = (userData) => {
    try {
      store.addUser({
        id: `user-${Date.now()}`,
        ...userData,
        registrationDate: new Date().toISOString().split('T')[0],
        groups: [],
        offices: [],
        status: 'Activo'
      })
      
      setUsers(store.getUsers())
      setIsDialogOpen(false)
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleEditUser = (userData) => {
    try {
      store.updateUser(selectedUser.email, userData)
      setUsers(store.getUsers())
      setIsDialogOpen(false)
      setSelectedUser(null)
      toast({
        title: "Usuario actualizado",
        description: "Los cambios han sido guardados correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = (user) => {
    try {
      store.deleteUser(user.id)
      setUsers(store.getUsers())
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setDialogMode('add')
                setSelectedUser(null)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'add' ? 'Agregar Usuario' : 'Editar Usuario'}
              </DialogTitle>
            </DialogHeader>
            <UserForm
              initialData={selectedUser}
              onSubmit={dialogMode === 'add' ? handleAddUser : handleEditUser}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {users.map(user => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user.profileImage} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {user.role} · {user.workShift} · {user.status}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedUser(user)
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
                onClick={() => handleDeleteUser(user)}
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

export default UserManagement
