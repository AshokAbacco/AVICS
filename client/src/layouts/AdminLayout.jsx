import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import Loading from '../components/Loading.jsx'

export default function AdminLayout() {
  const { sidebarOpen } = useAppContext()
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <Loading label="Preparing your workspace..." />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className={`flex min-h-screen flex-col transition-all duration-200 ${sidebarOpen ? 'ml-64' : 'ml-[76px]'}`}>
        <Header />
        <main className="flex-1 p-5 lg:p-7">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
