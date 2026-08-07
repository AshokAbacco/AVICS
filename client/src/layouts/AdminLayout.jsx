import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { useAppContext } from '../context/AppContext.jsx'

export default function AdminLayout() {
  const { isExpanded } = useAppContext() // ✅ FIXED

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={`
          flex min-h-screen flex-1 flex-col transition-all duration-300
          ${isExpanded ? 'lg:ml-72' : 'lg:ml-20'}
        `}
      >
        <Header />

        <main className="flex-1 sm:p-5 lg:p-7">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  )
}