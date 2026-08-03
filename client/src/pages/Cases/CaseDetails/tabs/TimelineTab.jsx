import React, { useEffect, useState } from 'react'
import { History } from 'lucide-react'
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
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border bg-slate-50/60 px-4 py-4 sm:px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <History size={20} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800">Case Timeline</h3>
          <p className="text-xs text-slate-400">{timeline.length} {timeline.length === 1 ? 'event' : 'events'} recorded</p>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-5">
        {timeline.length === 0 ? (
          <p className="text-sm italic text-slate-300">No activity recorded yet.</p>
        ) : (
          <div className="space-y-0">
            {timeline.map((event, idx) => (
              <div key={event.id} className="relative flex gap-3.5 pb-6 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-4 ring-white">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  {idx < timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="-mt-0.5 min-w-0 pb-1">
                  <p className="text-sm font-semibold text-slate-800">{event.title}</p>
                  {event.description && <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{event.description}</p>}
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDateTime(event.eventDate)} · {event.creator?.name || 'System'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}