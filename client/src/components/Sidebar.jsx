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
      {/* Mobile backdrop -- tapping outside closes the drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-white transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 ${sidebarOpen ? 'lg:w-64' : 'lg:w-[76px]'}
        `}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
            <Icons.ShieldCheck size={18} />
          </div>
          {(sidebarOpen || true) && (
            <div className={`min-w-0 ${!sidebarOpen ? 'lg:hidden' : ''}`}>
              <p className="truncate text-sm font-bold text-slate-800">{APP_NAME}</p>
              <p className="truncate text-[11px] text-slate-400">Claims Management</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {MENU_ITEMS.map((item) => {
            const Icon = Icons[item.icon] || Icons.Circle
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  // Auto-close the drawer on mobile after navigating
                  if (window.innerWidth < 1024 && sidebarOpen) toggleSidebar()
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-primary-50 text-primary'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`
                }
                title={item.label}
              >
                <Icon size={18} className="shrink-0" />
                <span className={!sidebarOpen ? 'lg:hidden' : ''}>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-danger"
          >
            <Icons.LogOut size={18} className="shrink-0" />
            <span className={!sidebarOpen ? 'lg:hidden' : ''}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}