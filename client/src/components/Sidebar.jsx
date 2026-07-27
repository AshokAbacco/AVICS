import React from 'react'
import { NavLink } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { MENU_ITEMS } from '../constants/menu.js'
import { APP_NAME } from '../constants/theme.js'
import { useAppContext } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppContext()
  const { logout } = useAuth()

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-white transition-all duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <Icons.ShieldCheck size={18} />
          </div>

          <div className={!sidebarOpen ? 'lg:hidden' : ''}>
            <h1 className="text-sm font-bold text-slate-800">
              {APP_NAME}
            </h1>

            <p className="text-xs text-slate-400">
              Claims Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = Icons[item.icon] || Icons.Circle

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.label}
                onClick={() => {
                  if (window.innerWidth < 1024 && sidebarOpen) {
                    toggleSidebar()
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />

                <span className={!sidebarOpen ? 'lg:hidden' : ''}>
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-border p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600"
          >
            <Icons.LogOut size={18} />

            <span className={!sidebarOpen ? 'lg:hidden' : ''}>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}