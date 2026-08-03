import React, { useEffect, useState } from 'react'
import { MessagesSquare, Send } from 'lucide-react'
import Button from '../../../../components/Button.jsx'
import { getRemarks, addRemark } from '../../services/caseWizardService.js'

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function initials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

export default function RemarksTab({ caseId }) {
  const [remarks, setRemarks] = useState([])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  const loadRemarks = () => {
    setLoading(true)
    getRemarks(caseId).then(setRemarks).catch(() => setRemarks([])).finally(() => setLoading(false))
  }

  useEffect(() => { loadRemarks() }, [caseId])

  const handlePost = async () => {
    if (!note.trim()) return
    setPosting(true)
    try {
      await addRemark(caseId, note.trim())
      setNote('')
      loadRemarks()
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Failed to add remark.')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border bg-slate-50/60 px-4 py-4 sm:px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MessagesSquare size={20} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800">Remarks</h3>
          <p className="text-xs text-slate-400">{remarks.length} {remarks.length === 1 ? 'note' : 'notes'} on this case</p>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <div className="mb-5 flex items-start gap-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a remark..."
            rows={2}
            className="input-base flex-1"
          />
          <Button icon={Send} onClick={handlePost} disabled={posting || !note.trim()}>
            {posting ? 'Posting...' : 'Post'}
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading remarks...</p>
        ) : remarks.length === 0 ? (
          <p className="text-sm italic text-slate-300">No remarks yet.</p>
        ) : (
          <div className="space-y-3">
            {remarks.map((r) => (
              <div key={r.id} className="flex items-start gap-3 rounded-xl border border-border px-4 py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initials(r.user?.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                    <span className="text-sm font-semibold text-slate-800">{r.user?.name || 'Unknown'}</span>
                    <span className="text-xs text-slate-400">{formatDateTime(r.createdAt)}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">{r.note}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}