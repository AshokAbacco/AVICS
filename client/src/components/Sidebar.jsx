import React from 'react'
import { NavLink } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { MENU_ITEMS } from '../constants/menu.js'
import { APP_NAME } from '../constants/theme.js'
import { useAppContext } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Sidebar() {
  const { sidebarOpen } = useAppContext()
  const { logout } = useAuth()

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-white transition-all duration-200 ${
        sidebarOpen ? 'w-64' : 'w-[76px]'
      }`}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
          <Icons.ShieldCheck size={18} />
        </div>
        {sidebarOpen && (
          <div className="min-w-0">
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
              {sidebarOpen && <span className="truncate">{item.label}</span>}
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
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
