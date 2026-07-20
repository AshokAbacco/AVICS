import React from 'react'
import { APP_FULL_NAME } from '../constants/theme.js'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white px-5 py-4 text-center text-xs text-slate-400">
      © {new Date().getFullYear()} {APP_FULL_NAME}. All rights reserved.
    </footer>
  )
}
