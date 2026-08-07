import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, UserCircle, Sparkles } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getInitials } from '../utils/format.js'

export default function Header() {
  const { toggleSidebar, unreadCount } = useAppContext()
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200/70 bg-white/75 px-5 backdrop-blur-2xl transition-all duration-200">
      {/* Left Section: Sidebar Toggle & Global Search */}
      <div className="flex items-center gap-3">
        

        {/* Global Search Input Bar */}
        <div className="relative hidden sm:block">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search cases, victims, vehicles..."
            className="w-72 rounded-xl border border-slate-200/80 bg-slate-100/50 py-2 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:w-80 focus:border-violet-500/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 shadow-inner-xs"
          />
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right Section: Notifications & User Profile */}
      <div className="flex items-center gap-2">
        

        {/* Vertical Separator */}
        <div className="mx-1.5 h-6 w-px bg-slate-200/80" />

        {/* User Profile Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="group flex items-center gap-2.5 rounded-xl p-1.5 transition-all hover:bg-slate-100/80 active:scale-98"
          >
            <div className="relative shrink-0">
              {/* Modern Violet/Indigo Gradient Avatar */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 text-xs font-bold text-white shadow-md shadow-violet-600/20 ring-2 ring-violet-500/20">
                {getInitials(user?.name || 'AV ICS')}
              </div>
              {/* Online Indicator Badge */}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold leading-tight text-slate-800 transition-colors group-hover:text-violet-700">
                {user?.name || 'Executive User'}
              </p>
              <p className="text-[11px] font-medium leading-tight text-slate-400 capitalize">
                {user?.role || 'Claims Adjudicator'}
              </p>
            </div>

            <ChevronDown
              size={15}
              strokeWidth={2.2}
              className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180 text-violet-600' : 'group-hover:text-slate-600'}`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <>
              {/* Overlay Backdrop to Close Dropdown */}
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />

              <div className="absolute right-0 z-20 mt-2.5 w-56 origin-top-right overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-2xl transition-all">
                {/* User Mobile Info Banner inside Menu */}
                <div className="px-3.5 py-2 sm:hidden border-b border-slate-100 mb-1">
                  <p className="text-sm font-bold text-slate-800">{user?.name || 'Executive User'}</p>
                  <p className="text-[11px] font-medium text-slate-400">{user?.role || 'Adjudicator'}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-violet-50 hover:text-violet-700"
                >
                  <UserCircle size={17} strokeWidth={2} className="text-slate-400 group-hover:text-violet-600" /> 
                  Profile
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-violet-50 hover:text-violet-700"
                >
                  <Settings size={17} strokeWidth={2} className="text-slate-400 group-hover:text-violet-600" /> 
                  Settings
                </Link>

                <div className="my-1 h-px bg-slate-100" />

                <button
                  onClick={() => {
                    setProfileOpen(false)
                    logout()
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut size={17} strokeWidth={2} /> 
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}