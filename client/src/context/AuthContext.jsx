import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const DEFAULT_USER = {
  id: 'USR-1001',
  name: 'Ramesh Kulkarni',
  email: 'ramesh.kulkarni@avics.gov.in',
  role: 'Claims Administrator',
  avatar: null,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem('avics_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = (credentials) => {
    const loggedInUser = { ...DEFAULT_USER, email: credentials?.email || DEFAULT_USER.email }
    sessionStorage.setItem('avics_user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
    return loggedInUser
  }

  const logout = () => {
    sessionStorage.removeItem('avics_user')
    setUser(null)
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
