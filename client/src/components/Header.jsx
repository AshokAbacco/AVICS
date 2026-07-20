import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, UserCircle } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getInitials } from '../utils/format.js'

export default function Header() {
  const { toggleSidebar, unreadCount } = useAppContext()
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white/90 px-5 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search cases, victims, vehicles..."
            className="w-72 rounded-xl border border-border bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </Link>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              {getInitials(user?.name || 'AV ICS')}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-slate-700">{user?.name}</p>
              <p className="text-[11px] text-slate-400">{user?.role}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-white py-1.5 shadow-elevated">
              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <UserCircle size={16} /> Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Settings size={16} /> Settings
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-red-50"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
