import React from 'react'
import { Outlet } from 'react-router-dom'

// MainLayout is a lightweight passthrough layout used for top-level route
// grouping; the actual chrome (sidebar/header) lives in AdminLayout.
export default function MainLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <Outlet />
    </div>
  )
}
