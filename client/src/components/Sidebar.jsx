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
      {/* Modern Mobile Overlay: Subtle blur and dark tint */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-[2px] transition-opacity lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container: Glassmorphic, Floating, Smooth transitions */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col overflow-hidden border-r border-slate-200/80 bg-white/80 backdrop-blur-xl transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 ${sidebarOpen ? 'lg:w-72' : 'lg:w-20'}`}
      >
        {/* Logo Header */}
        <div className="flex h-[68px] shrink-0 items-center px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/20 transition-transform group-hover:scale-105">
              <Icons.ShieldCheck size={18} strokeWidth={2.5} />
            </div>

            <div className={`overflow-hidden transition-all duration-300 ${!sidebarOpen ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
              <h1 className="whitespace-nowrap text-base font-semibold tracking-tight text-slate-900">
                {APP_NAME}
              </h1>
              <p className="whitespace-nowrap text-xs font-medium text-slate-400">
                Claims Management
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex h-full flex-col">
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
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
                    `group flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                    ${!sidebarOpen ? 'lg:justify-center' : ''}
                    ${
                      isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={18}
                        strokeWidth={2}
                        className={`shrink-0 transition-colors duration-200 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}
                      />

                      <span className={`whitespace-nowrap transition-all duration-300 ${!sidebarOpen ? 'lg:hidden lg:opacity-0' : 'opacity-100'}`}>
                        {item.label}
                      </span>

                      {/* Modern Active Indicator Dot */}
                      {isActive && (
                        <span className={`ml-auto h-1.5 w-1.5 rounded-full bg-slate-900 transition-all ${!sidebarOpen ? 'lg:hidden' : ''}`} />
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* Modern User Profile Footer */}
          <div className="shrink-0 border-t border-slate-200/80 p-3">
            <div className={`group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 ${!sidebarOpen ? 'lg:justify-center' : ''}`}>
              {/* Avatar with Status Ring */}
              <div className="relative shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-100 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                  JD
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>

              {/* User Info */}
              <div className={`flex-1 overflow-hidden transition-all duration-300 ${!sidebarOpen ? 'lg:hidden lg:w-0 lg:opacity-0' : 'opacity-100'}`}>
                <p className="truncate text-sm font-semibold text-slate-800">John Doe</p>
                <p className="truncate text-xs text-slate-400">Administrator</p>
              </div>

              {/* Expanded Logout */}
              <button
                onClick={logout}
                className={`flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 ${!sidebarOpen ? 'lg:hidden' : ''}`}
                title="Logout"
              >
                <Icons.LogOut size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Collapsed Logout */}
            <button
              onClick={logout}
              className={`mt-1 hidden w-full items-center justify-center rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 ${!sidebarOpen ? 'lg:flex' : 'lg:hidden'}`}
              title="Logout"
            >
              <Icons.LogOut size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}