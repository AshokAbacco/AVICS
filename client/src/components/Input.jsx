import React from 'react'

export default function Input({ label, error, icon: Icon, className = '', ...rest }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>}
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input className={`input-base ${Icon ? 'pl-10' : ''} ${className}`} {...rest} />
      </div>
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  )
}
