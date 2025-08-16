/**
 * WebSocket client for real-time updates
 * Provides real-time notifications for scan progress, findings, and system events
 */

export interface WebSocketMessage {
  type: 'scan_started' | 'scan_progress' | 'scan_completed' | 'finding_created' | 'finding_updated' | 'system_alert'
  data: any
  timestamp: string
}

export interface ScanProgressData {
  scanId: string
  repositoryId: string
  progress: number
  stage: string
  message?: string
}

export interface FindingData {
  id: string
  scanId: string
  repositoryId: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  type: 'security' | 'license' | 'config'
}

class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  constructor() {
    this.connect()
  }

  private connect() {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws'
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.reconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (err) {
      console.error('Failed to connect to WebSocket:', err)
      this.reconnect()
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)
      
      setTimeout(() => {
        this.connect()
      }, delay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const listeners = this.listeners.get(message.type)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message.data)
        } catch (err) {
          console.error('Error in WebSocket message handler:', err)
        }
      })
    }

    // Also notify global listeners
    const globalListeners = this.listeners.get('*')
    if (globalListeners) {
      globalListeners.forEach(callback => {
        try {
          callback(message)
        } catch (err) {
          console.error('Error in global WebSocket message handler:', err)
        }
      })
    }
  }

  public subscribe(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(callback)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.listeners.delete(eventType)
        }
      }
    }
  }

  public unsubscribe(eventType: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.delete(callback)
      if (listeners.size === 0) {
        this.listeners.delete(eventType)
      }
    }
  }

  public send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Create singleton instance
export const wsClient = new WebSocketClient()

// React hook for WebSocket subscriptions
export function useWebSocket(eventType: string, callback: (data: any) => void) {
  React.useEffect(() => {
    const unsubscribe = wsClient.subscribe(eventType, callback)
    return unsubscribe
  }, [eventType, callback])
}

// React hook for connection status
export function useWebSocketStatus() {
  const [isConnected, setIsConnected] = React.useState(wsClient.isConnected())

  React.useEffect(() => {
    const checkConnection = () => {
      setIsConnected(wsClient.isConnected())
    }

    const interval = setInterval(checkConnection, 1000)
    return () => clearInterval(interval)
  }, [])

  return isConnected
}

import React from 'react'