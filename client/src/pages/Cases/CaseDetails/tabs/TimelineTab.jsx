import React, { useEffect, useState } from 'react'
import { getTimeline } from '../../services/caseWizardService.js'

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function TimelineTab({ caseId }) {
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTimeline(caseId).then(setTimeline).catch(() => setTimeline([])).finally(() => setLoading(false))
  }, [caseId])

  if (loading) {
    return <div className="card p-6"><p className="text-sm text-slate-400">Loading timeline...</p></div>
  }

  return (
    <div className="card p-4 sm:p-6">
      <h3 className="mb-4 text-base font-semibold text-slate-800">Case Timeline</h3>
      {timeline.length === 0 ? (
        <p className="text-sm text-slate-400">No activity recorded yet.</p>
      ) : (
        <div className="space-y-0">
          {timeline.map((event, idx) => (
            <div key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
              <div className="flex flex-col items-center">
                <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                {idx < timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
              </div>
              <div className="-mt-1">
                <p className="text-sm font-medium text-slate-700">{event.title}</p>
                {event.description && <p className="mt-0.5 text-sm text-slate-500">{event.description}</p>}
                <p className="mt-0.5 text-xs text-slate-400">
                  {formatDateTime(event.eventDate)} · {event.creator?.name || 'System'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}