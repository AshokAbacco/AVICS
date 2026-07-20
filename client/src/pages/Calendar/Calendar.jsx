import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Gavel, Users, Clock } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import { CALENDAR_EVENTS } from '../../data/calendarEvents.js'

const TYPE_ICON = {
  'Court Hearing': Gavel,
  Meeting: Users,
  Deadline: Clock,
}

const TYPE_COLOR = {
  'Court Hearing': 'bg-primary-50 text-primary-700',
  Meeting: 'bg-emerald-50 text-emerald-700',
  Deadline: 'bg-amber-50 text-amber-700',
}

export default function Calendar() {
  const [cursor, setCursor] = useState(new Date(2026, 6, 1)) // July 2026

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const days = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells = []
    for (let i = 0; i < startOffset; i += 1) cells.push(null)
    for (let d = 1; d <= daysInMonth; d += 1) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push({
        day: d,
        dateStr,
        events: CALENDAR_EVENTS.filter((e) => e.date === dateStr),
      })
    }
    return cells
  }, [cursor])

  const changeMonth = (delta) => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="View upcoming hearings, deadlines, and meetings."
        breadcrumbItems={[{ label: 'Calendar' }]}
      />

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">{monthLabel}</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-slate-500 hover:bg-slate-50">
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => changeMonth(1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-slate-500 hover:bg-slate-50">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-slate-400">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((cell, idx) => (
            <div
              key={idx}
              className={`min-h-[92px] rounded-xl border p-2 text-left ${cell ? 'border-border bg-white' : 'border-transparent'}`}
            >
              {cell && (
                <>
                  <span className="text-xs font-medium text-slate-500">{cell.day}</span>
                  <div className="mt-1 space-y-1">
                    {cell.events.map((e) => {
                      const Icon = TYPE_ICON[e.type] || Clock
                      return (
                        <div key={e.id} className={`flex items-center gap-1 truncate rounded-md px-1.5 py-1 text-[10px] font-medium ${TYPE_COLOR[e.type]}`}>
                          <Icon size={10} className="shrink-0" />
                          <span className="truncate">{e.title}</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 card p-5">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Upcoming Events</h3>
        <div className="divide-y divide-border">
          {CALENDAR_EVENTS.map((e) => {
            const Icon = TYPE_ICON[e.type] || Clock
            return (
              <div key={e.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${TYPE_COLOR[e.type]}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{e.title}</p>
                    <p className="text-xs text-slate-400">{e.type}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-500">{e.date}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
