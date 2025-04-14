
import React, { useEffect } from 'react'
import { useToast } from './ui/use-toast'

function NotificationHandler() {
  const { toast } = useToast()

  useEffect(() => {
    if (!("Notification" in window)) {
      console.log("Este navegador no soporta notificaciones de escritorio")
      return
    }

    const requestPermission = async () => {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        toast({
          title: "Notificaciones desactivadas",
          description: "Activa las notificaciones para recibir alertas de nuevos mensajes.",
          variant: "destructive",
        })
      }
    }

    requestPermission()
  }, [toast])

  const showNotification = (title, body, sound = 'default') => {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        body,
        icon: "https://iberdesarrollos.es/wp-content/uploads/2025/02/Iberdes-Whatsapp.png"
      })

      // Reproducir sonido de notificación
      const audio = new Audio(`/sounds/${sound}.mp3`)
      audio.play()
    }
  }

  return null
}

export default NotificationHandler
