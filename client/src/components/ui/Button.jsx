import React from 'react'

const VARIANT_CLASSES = {
  primary: 'bg-primary text-white hover:bg-primary-700 disabled:bg-primary/50',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50',
  ghost: 'text-slate-500 hover:bg-slate-50 disabled:opacity-50',
}

export default function Button({
  children, variant = 'primary', icon: Icon, type = 'button',
  onClick, disabled = false, loading = false, fullWidth = false, className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium
        transition-colors disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        Icon && <Icon size={16} />
      )}
      {children}
    </button>
  )
}
