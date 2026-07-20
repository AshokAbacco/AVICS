import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-500">
      <Link to="/dashboard" className="flex items-center gap-1 hover:text-primary">
        <Home size={14} />
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={item.label}>
          <ChevronRight size={14} className="text-slate-300" />
          {item.path && idx !== items.length - 1 ? (
            <Link to={item.path} className="hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-700">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
