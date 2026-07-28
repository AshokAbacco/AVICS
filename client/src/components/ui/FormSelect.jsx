import React from 'react'

export default function FormSelect({
  label, name, value, onChange, options = [], required = false,
  error, placeholder = 'Select...', disabled = false, fullWidth = false,
}) {
  return (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
      {label && (
        <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
          disabled:cursor-not-allowed disabled:bg-slate-50
          ${error ? 'border-red-400' : 'border-border'}`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
