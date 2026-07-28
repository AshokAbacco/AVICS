import React from 'react'

export default function Card({ title, subtitle, actions, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-border bg-white p-4 sm:p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
