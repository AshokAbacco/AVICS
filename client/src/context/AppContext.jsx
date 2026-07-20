import React, { createContext, useContext, useState } from 'react'
import { NOTIFICATIONS } from '../data/notifications.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'Read' } : n))
    )
  }

  const unreadCount = notifications.filter((n) => n.status === 'Unread').length

  return (
    <AppContext.Provider
      value={{ sidebarOpen, toggleSidebar, notifications, markNotificationRead, unreadCount }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)
