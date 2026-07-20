import React from 'react'
import Breadcrumb from './Breadcrumb.jsx'

export default function PageHeader({ title, subtitle, breadcrumbItems = [], actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="mt-2 text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}
