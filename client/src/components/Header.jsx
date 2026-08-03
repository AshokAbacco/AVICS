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
    <header className="sticky top-0 z-20 flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-900"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} strokeWidth={2} />
        </button>

        <div className="relative hidden sm:block">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search cases, victims, vehicles..."
            className="w-72 rounded-xl border border-slate-200/80 bg-slate-50/60 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Link
          to="/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-900"
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </Link>

        <div className="mx-1 h-6 w-px bg-slate-200/80" />

        <div className="relative">
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="group flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-slate-50"
          >
            <div className="relative shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-100 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                {getInitials(user?.name || 'AV ICS')}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold leading-tight text-slate-800">{user?.name}</p>
              <p className="text-[11px] leading-tight text-slate-400">{user?.role}</p>
            </div>
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-52 origin-top-right overflow-hidden rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-lg shadow-slate-900/10">
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <UserCircle size={16} strokeWidth={2} /> Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Settings size={16} strokeWidth={2} /> Settings
                </Link>
                <div className="my-1 h-px bg-slate-100" />
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut size={16} strokeWidth={2} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}