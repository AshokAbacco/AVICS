//client\src\pages\Users\UserManagement.jsx
import React, { useState } from 'react'
import { UserCog, UserCheck, Building, UserX } from 'lucide-react'
import ManagementPage from '../../components/ManagementPage.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { formatDate } from '../../utils/format.js'
import { getUsers, createUser, updateUser, deleteUser } from './services/userService.js'

// The User model's `role` is a free-text string (no schema enum) — this is
// the working list of roles this app actually assigns today. Confirm this
// matches your organization's real roles before shipping; edit freely.
const USER_ROLES = ['Administrator', 'Agent', 'Data Entry Operator', 'Case Manager', 'Investigator', 'Legal Officer']

// Matches the UserStatus enum in schema.prisma exactly.
const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
]

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'department', label: 'Department', render: (row) => row.department || '—' },
  { key: 'lastLogin', label: 'Last Login', render: (row) => (row.lastLogin ? formatDate(row.lastLogin) : 'Never') },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

const formFields = [
  { name: 'name', label: 'Full Name', fullWidth: true },
  { name: 'email', label: 'Email Address', type: 'email' },
  { name: 'password', label: 'Password (required for new users, leave blank to keep current on edit)', type: 'password', fullWidth: true },
  { name: 'role', label: 'Role', type: 'select', options: USER_ROLES },
  { name: 'department', label: 'Department' },
  { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS },
]

export default function UserManagement() {
  // Populated via ManagementPage's onDataChange, since it owns the fetched
  // `items` state internally and doesn't otherwise expose it upward.
  const [users, setUsers] = useState([])

  const stats = [
    { label: 'Total Users', value: users.length, icon: UserCog, tone: 'primary' },
    { label: 'Active', value: users.filter((u) => u.status === 'ACTIVE').length, icon: UserCheck, tone: 'success' },
    { label: 'Departments', value: new Set(users.map((u) => u.department).filter(Boolean)).size, icon: Building, tone: 'accent' },
    { label: 'Inactive', value: users.filter((u) => u.status === 'INACTIVE').length, icon: UserX, tone: 'warning' },
  ]

  return (
    <ManagementPage
      title="User Management"
      subtitle="Manage system users, roles, and access."
      breadcrumbLabel="Users"
      columns={columns}
      formFields={formFields}
      searchKeys={['name', 'email', 'role']}
      filterField="role"
      filterOptions={USER_ROLES}
      filterLabel="Role"
      stats={stats}
      idPrefix="USR"
      onFetch={getUsers}
      onCreate={createUser}
      onUpdate={updateUser}
      onDelete={deleteUser}
      onDataChange={setUsers}
    />
  )
}