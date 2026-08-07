import React, { createContext, useContext, useState, useEffect } from 'react'
import { NOTIFICATIONS } from '../data/notifications.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

  const [notifications, setNotifications] = useState(NOTIFICATIONS)

  // Handle screen resize (IMPORTANT)
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  // 🔥 MAIN LOGIC
  const isExpanded = isDesktop ? sidebarHovered : sidebarOpen

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'Read' } : n))
    )
  }

  const unreadCount = notifications.filter((n) => n.status === 'Unread').length

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        sidebarHovered,
        setSidebarHovered,
        isExpanded,   // ✅ IMPORTANT
        notifications,
        markNotificationRead,
        unreadCount
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)