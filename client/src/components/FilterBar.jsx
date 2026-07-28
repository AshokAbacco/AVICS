import React from 'react'
import { SlidersHorizontal } from 'lucide-react'

export default function FilterBar({ value, onChange, options = [], label = 'Status' }) {
  return (
    <div className="relative w-full sm:w-52">
      <SlidersHorizontal size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-base appearance-none pl-10"
      >
        <option value="All">All {label}</option>
        {options.map((opt) => {
          const optionValue = typeof opt === 'string' ? opt : opt.value
          const optionLabel = typeof opt === 'string' ? opt : opt.label
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          )
        })}
      </select>
    </div>
  )
}
