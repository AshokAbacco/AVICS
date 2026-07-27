import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import AuthLayout from '../layouts/AuthLayout.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'

import Login from '../pages/Auth/Login.jsx'
import Dashboard from '../pages/Dashboard/Dashboard.jsx'
import CaseManagement from '../pages/Cases/CaseManagement.jsx'
import VictimManagement from '../pages/Victims/VictimManagement.jsx'
import VehicleManagement from '../pages/Vehicles/VehicleManagement.jsx'
import HospitalManagement from '../pages/Hospitals/HospitalManagement.jsx'
import PoliceManagement from '../pages/Police/PoliceManagement.jsx'
import CourtManagement from '../pages/Court/CourtManagement.jsx'
import AdvocateManagement from '../pages/Advocates/AdvocateManagement.jsx'
import DocumentManagement from '../pages/Documents/DocumentManagement.jsx'
import CompensationManagement from '../pages/Compensation/CompensationManagement.jsx'
import Reports from '../pages/Reports/Reports.jsx'
import UserManagement from '../pages/Users/UserManagement.jsx'
import Notifications from '../pages/Notifications/Notifications.jsx'
import AuditLogs from '../pages/AuditLogs/AuditLogs.jsx'
import Calendar from '../pages/Calendar/Calendar.jsx'
import Settings from '../pages/Settings/Settings.jsx'
import Profile from '../pages/Profile/Profile.jsx'
import NotFound from '../pages/Errors/NotFound.jsx'
import Unauthorized from '../pages/Errors/Unauthorized.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Default route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* =======================================================
          LOGIN ROUTES (TEMPORARILY DISABLED)
          Uncomment these when authentication is implemented.
      ======================================================== */}

      {/*
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>
      */}
      

      {/* Temporary redirect so /login never shows 404 */}
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />

      {/* Protected/Admin Pages */}
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cases" element={<CaseManagement />} />
        <Route path="/victims" element={<VictimManagement />} />
        <Route path="/vehicles" element={<VehicleManagement />} />
        <Route path="/hospitals" element={<HospitalManagement />} />
        <Route path="/police" element={<PoliceManagement />} />
        <Route path="/court" element={<CourtManagement />} />
        <Route path="/advocates" element={<AdvocateManagement />} />
        <Route path="/documents" element={<DocumentManagement />} />
        <Route path="/compensation" element={<CompensationManagement />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}