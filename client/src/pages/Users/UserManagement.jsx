import React from 'react'
import { UserCog, UserCheck, Building, UserX } from 'lucide-react'
import ManagementPage from '../../components/ManagementPage.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { USERS, USER_ROLES } from '../../data/users.js'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'department', label: 'Department' },
  { key: 'lastLogin', label: 'Last Login' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

const formFields = [
  { name: 'name', label: 'Full Name', fullWidth: true },
  { name: 'email', label: 'Email Address', type: 'email' },
  { name: 'role', label: 'Role', type: 'select', options: USER_ROLES },
  { name: 'department', label: 'Department' },
  { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
]

export default function UserManagement() {
  const stats = [
    { label: 'Total Users', value: USERS.length, icon: UserCog, tone: 'primary' },
    { label: 'Active', value: USERS.filter((u) => u.status === 'Active').length, icon: UserCheck, tone: 'success' },
    { label: 'Departments', value: new Set(USERS.map((u) => u.department)).size, icon: Building, tone: 'accent' },
    { label: 'Inactive', value: USERS.filter((u) => u.status === 'Inactive').length, icon: UserX, tone: 'warning' },
  ]

  return (
    <ManagementPage
      title="User Management"
      subtitle="Manage system users, roles, and access."
      breadcrumbLabel="Users"
      initialData={USERS}
      columns={columns}
      formFields={formFields}
      searchKeys={['name', 'email', 'role']}
      filterField="role"
      filterOptions={USER_ROLES}
      filterLabel="Role"
      stats={stats}
      idPrefix="USR"
    />
  )
}
