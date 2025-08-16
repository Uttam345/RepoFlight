"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWebSocket } from '@/lib/websocket'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  autoClose?: boolean
  duration?: number
}

const notificationIcons = {
  success: CheckCircle,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
}

const notificationColors = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Listen for WebSocket events and create notifications
  useWebSocket('scan_started', (data) => {
    addNotification({
      type: 'info',
      title: 'Scan Started',
      message: `Security scan started for repository: ${data.repositoryName}`,
      autoClose: true,
      duration: 5000,
    })
  })

  useWebSocket('scan_completed', (data) => {
    addNotification({
      type: 'success',
      title: 'Scan Completed',
      message: `Security scan completed for ${data.repositoryName}. Found ${data.findingsCount} issues.`,
      autoClose: true,
      duration: 8000,
    })
  })

  useWebSocket('finding_created', (data) => {
    if (data.severity === 'critical' || data.severity === 'high') {
      addNotification({
        type: data.severity === 'critical' ? 'error' : 'warning',
        title: `${data.severity.charAt(0).toUpperCase() + data.severity.slice(1)} Vulnerability Found`,
        message: `${data.title} in ${data.repositoryName}`,
        autoClose: false,
      })
    }
  })

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    }

    setNotifications(prev => [newNotification, ...prev])

    if (notification.autoClose) {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, notification.duration || 5000)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </>
  )
}

function NotificationContainer({ 
  notifications, 
  onRemove 
}: { 
  notifications: Notification[]
  onRemove: (id: string) => void 
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function NotificationItem({ 
  notification, 
  onRemove 
}: { 
  notification: Notification
  onRemove: (id: string) => void 
}) {
  const Icon = notificationIcons[notification.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
      className="w-full"
    >
      <Card className={`border ${notificationColors[notification.type]} shadow-lg`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <p className="text-sm opacity-90 mt-1">{notification.message}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-black/10"
                  onClick={() => onRemove(notification.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}