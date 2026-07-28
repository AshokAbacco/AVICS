import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import AuthLayout from '../layouts/AuthLayout.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'

import Login from '../pages/Auth/Login.jsx'

import Dashboard from '../pages/Dashboard/Dashboard.jsx'
import CaseManagement from '../pages/Cases/CaseManagement.jsx'
import NewCaseWizard from '../pages/Cases/NewCase/NewCaseWizard.jsx'
import CaseDetails from '../pages/Cases/CaseDetails/CaseDetails.jsx'
import VictimManagement from '../pages/Victims/VictimManagement.jsx'
import VehicleManagement from '../pages/Vehicles/VehicleManagement.jsx'
import HospitalManagement from '../pages/Hospitals/HospitalManagement.jsx'
import PoliceManagement from '../pages/Police/PoliceManagement.jsx'
import CourtManagement from '../pages/Court/CourtManagement.jsx'
import AdvocateManagement from '../pages/Advocates/AdvocateManagement.jsx'
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

        {/* New Case Wizard — Step 1 has no caseId yet, later steps do */}
        <Route path="/cases/new" element={<NewCaseWizard />} />
        <Route path="/cases/new/:caseId/:step" element={<NewCaseWizard />} />

        {/* Case Details — read/edit view for a submitted case, tabbed */}
        <Route path="/cases/:id" element={<CaseDetails />} />
        <Route path="/cases/:id/:tab" element={<CaseDetails />} />

        <Route path="/victims" element={<VictimManagement />} />
        <Route path="/vehicles" element={<VehicleManagement />} />
        <Route path="/hospitals" element={<HospitalManagement />} />
        <Route path="/police" element={<PoliceManagement />} />
        <Route path="/court" element={<CourtManagement />} />
        <Route path="/advocates" element={<AdvocateManagement />} />
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