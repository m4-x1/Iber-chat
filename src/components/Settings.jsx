
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from './ui/use-toast'
import { useAuth } from '../contexts/AuthContext'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'

function Settings() {
  const { isDark, toggleTheme, updateThemeColors, updateFontFamily } = useTheme()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    // Configuración General
    darkBackgroundColor: '#1a1a1a',
    lightBackgroundColor: '#ffffff',
    fontFamily: 'Inter',
    darkTextColor: '#ffffff',
    lightTextColor: '#000000',
    darkIconColor: '#ffffff',
    lightIconColor: '#000000',
    // Notificaciones de Escritorio
    desktopMessageSound: 'default',
    desktopGroupSound: 'default',
    desktopNotificationTitle: '{{userName}} te ha enviado un mensaje',
    desktopNotificationBody: '',
    // Notificaciones Móvil
    mobileMessageSound: 'default',
    mobileGroupSound: 'default',
    mobileNotificationTitle: '{{userName}} te ha enviado un mensaje',
    mobileNotificationBody: ''
  })

  const fontFamilies = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Montserrat',
    'Poppins',
    'Arial',
    'Helvetica'
  ]

  const notificationSounds = [
    { value: 'default', label: 'Por defecto' },
    { value: 'classic', label: 'Clásico' },
    { value: 'modern', label: 'Moderno' },
    { value: 'subtle', label: 'Sutil' },
    { value: 'none', label: 'Sin sonido' }
  ]

  const handleChange = (name, value) => {
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Guardar configuración en localStorage
    localStorage.setItem('appSettings', JSON.stringify(settings))
    
    // Aplicar cambios
    updateThemeColors({
      dark: {
        background: settings.darkBackgroundColor,
        text: settings.darkTextColor,
        icon: settings.darkIconColor
      },
      light: {
        background: settings.lightBackgroundColor,
        text: settings.lightTextColor,
        icon: settings.lightIconColor
      }
    })
    
    updateFontFamily(settings.fontFamily)
    
    toast({
      title: "Configuración guardada",
      description: "Los cambios han sido aplicados correctamente.",
    })
  }

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  if (currentUser.role !== 'God') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto p-6"
      >
        <h2 className="text-2xl font-bold mb-8">Configuración Personal</h2>
        <p className="text-muted-foreground">
          La configuración general de la aplicación solo está disponible para usuarios con rol God.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-6"
    >
      <h2 className="text-2xl font-bold mb-8">Configuración General</h2>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Tema Oscuro</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Color de fondo</label>
                  <input
                    type="color"
                    value={settings.darkBackgroundColor}
                    onChange={(e) => handleChange('darkBackgroundColor', e.target.value)}
                    className="w-full h-10 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color de texto</label>
                  <input
                    type="color"
                    value={settings.darkTextColor}
                    onChange={(e) => handleChange('darkTextColor', e.target.value)}
                    className="w-full h-10 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color de íconos</label>
                  <input
                    type="color"
                    value={settings.darkIconColor}
                    onChange={(e) => handleChange('darkIconColor', e.target.value)}
                    className="w-full h-10 rounded-md cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Tema Claro</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Color de fondo</label>
                  <input
                    type="color"
                    value={settings.lightBackgroundColor}
                    onChange={(e) => handleChange('lightBackgroundColor', e.target.value)}
                    className="w-full h-10 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color de texto</label>
                  <input
                    type="color"
                    value={settings.lightTextColor}
                    onChange={(e) => handleChange('lightTextColor', e.target.value)}
                    className="w-full h-10 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color de íconos</label>
                  <input
                    type="color"
                    value={settings.lightIconColor}
                    onChange={(e) => handleChange('lightIconColor', e.target.value)}
                    className="w-full h-10 rounded-md cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipografía</label>
            <select
              value={settings.fontFamily}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
            >
              {fontFamilies.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Notificaciones de Escritorio</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sonido de mensaje directo</label>
                  <select
                    value={settings.desktopMessageSound}
                    onChange={(e) => handleChange('desktopMessageSound', e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
                  >
                    {notificationSounds.map(sound => (
                      <option key={sound.value} value={sound.value}>{sound.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sonido de mensaje de grupo</label>
                  <select
                    value={settings.desktopGroupSound}
                    onChange={(e) => handleChange('desktopGroupSound', e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
                  >
                    {notificationSounds.map(sound => (
                      <option key={sound.value} value={sound.value}>{sound.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Título de notificación</label>
                  <input
                    type="text"
                    value={settings.desktopNotificationTitle}
                    onChange={(e) => handleChange('desktopNotificationTitle', e.target.value)}
                    placeholder="{{userName}} te ha enviado un mensaje"
                    className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cuerpo de notificación</label>
                  <input
                    type="text"
                    value={settings.desktopNotificationBody}
                    onChange={(e) => handleChange('desktopNotificationBody', e.target.value)}
                    placeholder="Dejar vacío para mostrar preview del mensaje"
                    className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Notificaciones Móviles</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sonido de mensaje directo</label>
                  <select
                    value={settings.mobileMessageSound}
                    onChange={(e) => handleChange('mobileMessageSound', e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
                  >
                    {notificationSounds.map(sound => (
                      <option key={sound.value} value={sound.value}>{sound.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sonido de mensaje de grupo</label>
                  <select
                    value={settings.mobileGroupSound}
                    onChange={(e) => handleChange('mobileGroupSound', e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
                  >
                    {notificationSounds.map(sound => (
                      <option key={sound.value} value={sound.value}>{sound.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Título de notificación</label>
                  <input
                    type="text"
                    value={settings.mobileNotificationTitle}
                    onChange={(e) => handleChange('mobileNotificationTitle', e.target.value)}
                    placeholder="{{userName}} te ha enviado un mensaje"
                    className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cuerpo de notificación</label>
                  <input
                    type="text"
                    value={settings.mobileNotificationBody}
                    onChange={(e) => handleChange('mobileNotificationBody', e.target.value)}
                    placeholder="Dejar vacío para mostrar preview del mensaje"
                    className="w-full px-3 py-2 rounded-md border border-border bg-accent/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Button onClick={handleSubmit} className="w-full">
          Guardar configuración
        </Button>
      </div>
    </motion.div>
  )
}

export default Settings
