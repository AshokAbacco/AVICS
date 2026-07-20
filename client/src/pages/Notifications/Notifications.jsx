import React from 'react'
import { Bell, Car, FileText, Gavel, Wallet, FolderPlus, CheckCheck } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import Button from '../../components/Button.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { useAppContext } from '../../context/AppContext.jsx'

const ICONS = {
  court: Gavel,
  document: FileText,
  compensation: Wallet,
  case: FolderPlus,
  vehicle: Car,
}

export default function Notifications() {
  const { notifications, markNotificationRead } = useAppContext()

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated on case activity, hearings, and document status."
        breadcrumbItems={[{ label: 'Notifications' }]}
        actions={
          <Button variant="outline" icon={CheckCheck} onClick={() => notifications.forEach((n) => markNotificationRead(n.id))}>
            Mark all as read
          </Button>
        }
      />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" description="New notifications will appear here." />
      ) : (
        <div className="card divide-y divide-border">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || Bell
            return (
              <div key={n.id} className="flex items-start gap-4 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${n.status === 'Unread' ? 'bg-primary-50 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                    {n.status === 'Unread' && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{n.time}</p>
                </div>
                {n.status === 'Unread' && (
                  <button
                    onClick={() => markNotificationRead(n.id)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
