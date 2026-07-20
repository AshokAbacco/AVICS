import React, { useState } from 'react'
import { Bell, Lock, Palette, Save } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import Input from '../../components/Input.jsx'
import Button from '../../components/Button.jsx'

const TABS = [
  { id: 'general', label: 'General', icon: Palette },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

export default function Settings() {
  const [tab, setTab] = useState('general')
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure system preferences and account security."
        breadcrumbItems={[{ label: 'Settings' }]}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <div className="card h-fit p-2 lg:col-span-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                tab === t.id ? 'bg-primary-50 text-primary' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="card p-6 lg:col-span-3">
          <form onSubmit={handleSave} className="space-y-5">
            {tab === 'general' && (
              <>
                <h3 className="text-sm font-semibold text-slate-700">General Preferences</h3>
                <Input label="Organization Name" defaultValue="Motor Accident Claims Tribunal - Maharashtra" />
                <Input label="Default Currency" defaultValue="INR (₹)" />
                <Input label="Time Zone" defaultValue="Asia/Kolkata (IST)" />
              </>
            )}
            {tab === 'security' && (
              <>
                <h3 className="text-sm font-semibold text-slate-700">Security Settings</h3>
                <Input label="Current Password" type="password" placeholder="••••••••" />
                <Input label="New Password" type="password" placeholder="••••••••" />
                <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" defaultChecked />
                  Enable two-factor authentication
                </label>
              </>
            )}
            {tab === 'notifications' && (
              <>
                <h3 className="text-sm font-semibold text-slate-700">Notification Preferences</h3>
                {['Hearing reminders', 'Compensation approvals', 'New case alerts', 'Document upload alerts'].map((label) => (
                  <label key={label} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm text-slate-600">
                    {label}
                    <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" defaultChecked />
                  </label>
                ))}
              </>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" icon={Save}>Save Changes</Button>
              {saved && <span className="text-sm font-medium text-success">Settings saved successfully.</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
