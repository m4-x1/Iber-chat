
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Edit2, Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { store } from '@/lib/store'
import GroupForm from './GroupForm'

function GroupManagement({ onSelectChat, onSectionChange }) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState('add')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOffice, setSelectedOffice] = useState('')

  useEffect(() => {
    loadGroups()
  }, [currentUser])

  const loadGroups = () => {
    let userGroups = []
    if (currentUser.role === 'God') {
      userGroups = store.getGroups()
    } else if (currentUser.role === 'Admin') {
      const adminOffices = store.getOfficesByAdmin(currentUser.id)
      userGroups = store.getGroups().filter(group => 
        adminOffices.some(office => office.id === group.officeId)
      )
    } else {
      userGroups = store.getGroups().filter(group => 
        group.members.includes(currentUser.id)
      )
    }
    setGroups(userGroups)
  }

  const handleAddGroup = (groupData) => {
    try {
      store.addGroup({
        id: `group-${Date.now()}`,
        ...groupData,
        createdAt: new Date().toISOString(),
        officeId: selectedOffice || (currentUser.role === 'Admin' ? store.getOfficesByAdmin(currentUser.id)[0]?.id : null)
      })
      
      loadGroups()
      setIsDialogOpen(false)
      toast({
        title: "Grupo creado",
        description: "El grupo ha sido creado correctamente",
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

  const handleEditGroup = (groupData) => {
    try {
      store.updateGroup(selectedGroup.id, {
        ...selectedGroup,
        ...groupData,
        officeId: selectedGroup.officeId
      })
      loadGroups()
      setIsDialogOpen(false)
      setSelectedGroup(null)
      toast({
        title: "Grupo actualizado",
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

  const handleDeleteGroup = (group) => {
    try {
      store.deleteGroup(group.id)
      loadGroups()
      toast({
        title: "Grupo eliminado",
        description: "El grupo ha sido eliminado correctamente",
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

  const handleGroupClick = (group, e) => {
    // Si el clic fue en un botón de editar o eliminar, no navegar al chat
    if (e.target.closest('button')) {
      return
    }

    const chat = store.getChats().find(c => c.groupId === group.id)
    if (chat) {
      onSelectChat(chat)
      onSectionChange('chats')
    }
  }

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesOffice = !selectedOffice || group.officeId === selectedOffice
    return matchesSearch && matchesOffice
  })

  const offices = store.getOffices()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Grupos</h2>
        {(currentUser.role === 'God' || currentUser.role === 'Admin') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setDialogMode('add')
                  setSelectedGroup(null)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {dialogMode === 'add' ? 'Crear Grupo' : 'Editar Grupo'}
                </DialogTitle>
              </DialogHeader>
              <GroupForm
                initialData={selectedGroup}
                onSubmit={dialogMode === 'add' ? handleAddGroup : handleEditGroup}
                onCancel={() => setIsDialogOpen(false)}
                selectedOffice={selectedOffice}
                offices={offices}
                isGod={currentUser.role === 'God'}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-md border border-border bg-accent/50"
          />
        </div>
        {currentUser.role === 'God' && (
          <select
            value={selectedOffice}
            onChange={(e) => setSelectedOffice(e.target.value)}
            className="px-4 py-2 rounded-md border border-border bg-accent/50"
          >
            <option value="">Todas las oficinas</option>
            {offices.map(office => (
              <option key={office.id} value={office.id}>
                {office.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid gap-4">
        {filteredGroups.map(group => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => handleGroupClick(group, e)}
            className="flex items-center justify-between p-4 bg-card rounded-lg border border-border cursor-pointer hover:bg-accent/50"
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={group.image} />
                <AvatarFallback>{group.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{group.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {group.members.length} miembros
                </p>
                <p className="text-xs text-muted-foreground">
                  Oficina: {offices.find(o => o.id === group.officeId)?.name || 'Desconocida'}
                </p>
              </div>
            </div>
            
            {(currentUser.role === 'God' || 
              (currentUser.role === 'Admin' && 
               store.getOfficesByAdmin(currentUser.id).some(office => office.id === group.officeId))) && (
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedGroup(group)
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
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteGroup(group)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default GroupManagement
