import React from 'react'

export default function FormInput({
  label, name, value, onChange, type = 'text', required = false,
  error, placeholder, disabled = false, fullWidth = false, ...rest
}) {
  return (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
      {label && (
        <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
          disabled:cursor-not-allowed disabled:bg-slate-50
          ${error ? 'border-red-400' : 'border-border'}`}
        {...rest}
      />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
