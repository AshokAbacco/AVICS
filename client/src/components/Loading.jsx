import React from 'react'
import { Loader2 } from 'lucide-react'

export default function Loading({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <Loader2 size={28} className="animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
