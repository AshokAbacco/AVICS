import React, { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import Button from '../../../../components/Button.jsx'
import { getRemarks, addRemark } from '../../services/caseWizardService.js'

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
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
    <div className="card p-4 sm:p-6">
      <h3 className="mb-4 text-base font-semibold text-slate-800">Remarks</h3>

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
        <p className="text-sm text-slate-400">No remarks yet.</p>
      ) : (
        <div className="space-y-4">
          {remarks.map((r) => (
            <div key={r.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{r.user?.name || 'Unknown'}</span>
                <span className="text-xs text-slate-400">{formatDateTime(r.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-600">{r.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}