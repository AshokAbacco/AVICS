import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { MENU_ITEMS } from '../constants/menu.js'
import { APP_NAME } from '../constants/theme.js'
import { useAppContext } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppContext()
  const { logout } = useAuth()

  const [isHovered, setIsHovered] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState(null)

  const isDesktop = window.innerWidth >= 1024
  const isExpanded = isDesktop ? isHovered : sidebarOpen

  // Smooth hover (no flicker)
  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout)
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setIsHovered(false), 120)
    setHoverTimeout(timeout)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden
          border-r border-[#8433ec]/20 bg-white/90 backdrop-blur-xl
          transition-all duration-300 ease-in-out

          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0

          ${isExpanded ? 'lg:w-72' : 'lg:w-20'}
          w-72
        `}
      >
        {/* Logo */}
        <div className="flex h-[68px] items-center px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8433ec] text-white shadow-md shadow-[#8433ec]/30 transition-transform group-hover:scale-110">
              <Icons.ShieldCheck size={18} strokeWidth={2.5} />
            </div>

            <div className={`transition-all duration-300 ${!isExpanded ? 'lg:hidden' : ''}`}>
              <h1 className="text-base font-semibold text-slate-900">
                {APP_NAME}
              </h1>
              <p className="text-xs text-[#8433ec]">Claims Management</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
            const Icon = Icons[item.icon] || Icons.Circle

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={!isExpanded ? item.label : ''}
                onClick={() => {
                  if (window.innerWidth < 1024 && sidebarOpen) {
                    toggleSidebar()
                  }
                }}
                className={({ isActive }) =>
                  `
                  relative group flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium
                  transition-all duration-200
                  ${!isExpanded ? 'lg:justify-center' : ''}
                  
                  ${
                    isActive
                      ? 'bg-[#8433ec] text-white shadow-lg shadow-[#8433ec]/40'
                      : 'text-slate-500 hover:bg-[#8433ec]/10 hover:text-[#8433ec]'
                  }
                `
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Glow Effect */}
                    {isActive && (
                      <span className="absolute inset-0 rounded-xl bg-[#8433ec] opacity-20 blur-md"></span>
                    )}

                    {/* Icon */}
                    <Icon
                      size={18}
                      strokeWidth={2}
                      className={`
                        relative z-10 shrink-0 transition-all duration-200
                        group-hover:scale-110
                        ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-[#8433ec]'
                        }
                      `}
                    />

                    {/* Label */}
                    <span
                      className={`
                        relative z-10 whitespace-nowrap transition-all duration-300
                        ${isExpanded ? 'opacity-100' : 'opacity-0 lg:hidden'}
                      `}
                    >
                      {item.label}
                    </span>

                    {/* Tooltip (collapsed) */}
                    {!isExpanded && (
                      <span className="absolute left-16 z-50 hidden whitespace-nowrap rounded-md bg-[#8433ec] px-2 py-1 text-xs text-white shadow-lg group-hover:block">
                        {item.label}
                      </span>
                    )}

                    {/* Active Dot */}
                    {isActive && isExpanded && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white"></span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#8433ec]/20 p-3">
          <div className={`flex items-center gap-3 ${!isExpanded ? 'lg:justify-center' : ''}`}>
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8433ec] text-white text-xs font-semibold">
                JD
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
            </div>

            {isExpanded && (
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">John Doe</p>
                <p className="text-xs text-[#8433ec]">Administrator</p>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:bg-[#8433ec] hover:text-white transition"
            >
              <Icons.LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}