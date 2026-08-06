import React, { useEffect, useRef, useState } from 'react'
import { FileStack, Upload, Download, CheckCircle2, XCircle, FileText } from 'lucide-react'
import Select from '../../../../components/Select.jsx'
import {
  listDocuments, uploadDocument, replaceDocument, getDocumentDownloadUrl, verifyDocument,
} from '../../services/caseWizardService.js'

const VERIFY_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
]

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function DocumentRow({ doc, onUploaded }) {
  const fileInputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const updated = doc.fileUpload
        ? await replaceDocument(doc.caseId, doc.id, file)
        : await uploadDocument(doc.caseId, doc.id, file)
      onUploaded(updated)
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  const handleDownload = async () => {
    try {
      const url = await getDocumentDownloadUrl(doc.caseId, doc.id)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Could not generate download link.')
    }
  }

  const handleVerifyChange = async (e) => {
    try {
      const updated = await verifyDocument(doc.caseId, doc.id, e.target.value)
      onUploaded({ ...doc, verified: updated.verified })
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Could not update verification status.')
    }
  }

  return (
    <tr className="border-b border-border last:border-0 hover:bg-slate-50/60">
      <td className="py-3 pr-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 ring-1 ring-slate-100">
            <FileText size={14} />
          </div>
          <span className="text-sm font-medium text-slate-700">{doc.documentType?.name}</span>
        </div>
      </td>
      <td className="py-3 pr-3 text-sm">
        {doc.received ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-100">
            <CheckCircle2 size={12} /> Received
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
            <XCircle size={12} /> Pending
          </span>
        )}
      </td>
      <td className="py-3 pr-3 text-sm text-slate-500">{formatDate(doc.receivedDate)}</td>
      <td className="py-3 pr-3">
        <Select value={doc.verified} onChange={handleVerifyChange} options={VERIFY_OPTIONS} className="!py-1.5 text-xs" />
      </td>
      <td className="py-3 pr-3">
        <div className="flex items-center gap-1">
          <label className={`cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-primary/10 hover:text-primary ${busy ? 'pointer-events-none opacity-50' : ''}`}>
            <Upload size={16} />
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} accept=".pdf,.jpg,.jpeg,.png" />
          </label>
          {doc.fileUpload && (
            <button onClick={handleDownload} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary">
              <Download size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

function DocumentTable({ title, documents, onUploaded }) {
  const receivedCount = documents.filter((d) => d.received).length
  return (
    <div className="card mb-4 overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-slate-50/60 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileStack size={20} />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-800">{title}</h4>
            <p className="text-xs text-slate-400">{receivedCount} of {documents.length} received</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-5">
        {documents.length === 0 ? (
          <p className="text-sm italic text-slate-300">No documents in this checklist yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-border text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  <th className="pb-2 pr-3">Document</th>
                  <th className="pb-2 pr-3">Received</th>
                  <th className="pb-2 pr-3">Received Date</th>
                  <th className="pb-2 pr-3">Verified</th>
                  <th className="pb-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => <DocumentRow key={doc.id} doc={doc} onUploaded={onUploaded} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DocumentsTab({ caseId }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  const loadDocuments = () => {
    setLoading(true)
    listDocuments(caseId)
      .then((data) => setDocuments(data.map((d) => ({ ...d, caseId }))))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadDocuments() }, [caseId])

  const handleRowUpdated = (updatedDoc) => {
    setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? { ...d, ...updatedDoc } : d)))
  }

  if (loading) {
    return <div className="card p-6"><p className="text-sm text-slate-400">Loading document checklist...</p></div>
  }

  const caseAndVictimDocs = documents.filter((d) => d.documentType?.category !== 'VEHICLE')
  const vehicleDocs = documents.filter((d) => d.documentType?.category === 'VEHICLE')

  return (
    <>
      <DocumentTable title="Case & Victim Documents" documents={caseAndVictimDocs} onUploaded={handleRowUpdated} />
      <DocumentTable title="Vehicle Documents" documents={vehicleDocs} onUploaded={handleRowUpdated} />
    </>
  )
}