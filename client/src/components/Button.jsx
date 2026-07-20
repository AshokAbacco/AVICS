import React from 'react'

const VARIANTS = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  danger: 'btn-danger',
  ghost: 'btn text-slate-500 hover:bg-slate-100',
}

export default function Button({
  children,
  variant = 'primary',
  icon: Icon,
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button type={type} className={`${VARIANTS[variant] || VARIANTS.primary} ${className}`} {...rest}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}
