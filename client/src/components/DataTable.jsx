import React from 'react'
import { ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from 'lucide-react'
import EmptyState from './EmptyState.jsx'
import Loading from './Loading.jsx'

export default function DataTable({
  columns,
  rows,
  page,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
}) {
  if (loading) return <Loading label="Loading records..." />

  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="table-th">
                  {col.label}
                </th>
              ))}
              {(onView || onEdit || onDelete) && <th className="table-th text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/70">
                {columns.map((col) => (
                  <td key={col.key} className="table-td">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {(onView || onEdit || onDelete) && (
                  <td className="table-td text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onView && (
                        <button
                          onClick={() => onView(row)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-primary-50 hover:text-primary"
                          aria-label="View"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-danger"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
