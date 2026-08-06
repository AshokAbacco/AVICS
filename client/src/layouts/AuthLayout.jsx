import React from 'react'
import { Outlet } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { APP_FULL_NAME } from '../constants/theme.js'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-700 via-primary to-secondary p-4">
      <div className="grid w-full max-w-6xl min-h-6xl overflow-hidden rounded-2xl bg-white shadow-elevated md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-primary-700 p-10 text-white md:flex">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <ShieldCheck size={20} />
            </div>
            <span className="text-lg font-bold">AVICS</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold leading-snug">{APP_FULL_NAME}</h2>
            <p className="mt-3 text-sm text-white/80">
              A unified platform to manage motor accident claims, victims, vehicles, court
              proceedings, and compensation — end to end.
            </p>
          </div>
          <p className="text-xs text-white/60">© {new Date().getFullYear()} AVICS. All rights reserved.</p>
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
