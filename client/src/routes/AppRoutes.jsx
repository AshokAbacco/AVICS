import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import AuthLayout from '../layouts/AuthLayout.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'

import Login from '../pages/Auth/Login.jsx'

import Dashboard from '../pages/Dashboard/Dashboard.jsx'
import CaseManagement from '../pages/Cases/CaseManagement.jsx'
import DocumentManagement from '../pages/Documents/DocumentManagement.jsx'
import Reports from '../pages/Reports/Reports.jsx'
import UserManagement from '../pages/Users/UserManagement.jsx'
import Notifications from '../pages/Notifications/Notifications.jsx'
import AuditLogs from '../pages/AuditLogs/AuditLogs.jsx'
import Settings from '../pages/Settings/Settings.jsx'
import Profile from '../pages/Profile/Profile.jsx'

import NotFound from '../pages/Errors/NotFound.jsx'
import Unauthorized from '../pages/Errors/Unauthorized.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Authentication Routes (Enable Later) */}
      {/*
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>
      */}

      {/* Temporary Login Redirect */}
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Routes */}
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Case Management */}
        <Route path="/cases" element={<CaseManagement />} />

        {/* Documents */}
        <Route path="/documents" element={<DocumentManagement />} />

        {/* Reports */}
        <Route path="/reports" element={<Reports />} />

        {/* User Management */}
        <Route path="/users" element={<UserManagement />} />

        {/* Notifications */}
        <Route path="/notifications" element={<Notifications />} />

        {/* Audit Logs */}
        <Route path="/audit-logs" element={<AuditLogs />} />

        {/* Settings */}
        <Route path="/settings" element={<Settings />} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}