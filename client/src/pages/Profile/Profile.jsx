import React, { useState } from 'react'
import { Mail, Phone, MapPin, Save } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import Input from '../../components/Input.jsx'
import Button from '../../components/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getInitials } from '../../utils/format.js'

export default function Profile() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Manage your personal information and account details."
        breadcrumbItems={[{ label: 'Profile' }]}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card flex flex-col items-center gap-3 p-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            {getInitials(user?.name || 'AV ICS')}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">{user?.name}</h3>
            <p className="text-sm text-slate-500">{user?.role}</p>
          </div>
          <div className="w-full space-y-2 pt-3 text-left text-sm text-slate-500">
            <p className="flex items-center gap-2"><Mail size={14} /> {user?.email}</p>
            <p className="flex items-center gap-2"><Phone size={14} /> +91 98220 11223</p>
            <p className="flex items-center gap-2"><MapPin size={14} /> Pune, Maharashtra</p>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-700">Personal Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Full Name" defaultValue={user?.name} />
              <Input label="Email Address" type="email" defaultValue={user?.email} />
              <Input label="Phone Number" defaultValue="+91 98220 11223" />
              <Input label="Designation" defaultValue={user?.role} />
              <Input label="Department" defaultValue="Claims Administration" />
              <Input label="Employee ID" defaultValue={user?.id} />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" icon={Save}>Save Changes</Button>
              {saved && <span className="text-sm font-medium text-success">Profile updated successfully.</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
