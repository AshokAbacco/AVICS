// client/src/pages/Documents/DocumentViewerPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, User, Car, FolderClosed, Download, Loader2, AlertCircle, Check } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import Button from '../../components/Button.jsx'
import { getDocument, getDownloadUrl, verifyDocument } from './services/documentService.js'

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
]

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FieldRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 ring-1 ring-slate-100">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`text-sm font-medium ${value ? 'text-slate-800' : 'italic text-slate-300'}`}>{value || 'Not recorded'}</p>
      </div>
    </div>
  )
}

export default function DocumentViewerPage() {
  const { documentId } = useParams()
  const navigate = useNavigate()

  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [fileUrl, setFileUrl] = useState(null)
  const [fileLoading, setFileLoading] = useState(false)
  const [fileError, setFileError] = useState('')

  const [status, setStatus] = useState('PENDING')
  const [remarks, setRemarks] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const goBack = () => navigate('/documents')

  useEffect(() => {
    setLoading(true)
    setLoadError('')
    getDocument(documentId)
      .then((doc) => {
        setDocument(doc)
        setStatus(doc.verified || 'PENDING')
        setRemarks(doc.remarks || '')

        if (!doc.fileUpload) return
        setFileLoading(true)
        getDownloadUrl(documentId)
          .then(setFileUrl)
          .catch((err) => setFileError(err?.response?.data?.message || 'Could not load the file preview.'))
          .finally(() => setFileLoading(false))
      })
      .catch((err) => setLoadError(err?.response?.data?.message || 'Failed to load document.'))
      .finally(() => setLoading(false))
  }, [documentId])

  const handleSave = async () => {
    if (status === 'REJECTED' && !remarks.trim()) {
      setSaveError('A reason is required when rejecting a document.')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      const updated = await verifyDocument(documentId, { status, remarks: remarks.trim() || undefined })
      setDocument((prev) => ({ ...prev, verified: updated.verified, remarks: updated.remarks }))
      goBack()
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Failed to update verification status.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-sm text-slate-400">Loading document...</div>
  }

  if (loadError || !document) {
    return (
      <div className="flex flex-col items-center gap-3 p-10 text-center">
        <AlertCircle className="text-danger" size={24} />
        <p className="text-sm text-slate-500">{loadError || 'Document not found.'}</p>
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-primary hover:text-primary"
        >
          <ArrowLeft size={13} /> Back to Documents
        </button>
      </div>
    )
  }

  const mimeType = document.fileUpload?.mimeType || ''
  const isPdf = mimeType === 'application/pdf'
  const isImage = mimeType.startsWith('image/')

  return (
    <div>
      <PageHeader
        title={document.documentType?.name || 'Document'}
        subtitle={`Case ${document.case?.caseNumber || ''}`}
        breadcrumbItems={[{ label: 'Documents', to: '/documents' }, { label: document.documentType?.name || 'Document' }]}
      />

      <button
        onClick={goBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary"
      >
        <ArrowLeft size={15} /> Back to Documents
      </button>

      <div className="card space-y-5 p-5">
        {/* Linked entity */}
        <div className="rounded-xl border border-border bg-slate-50/60 p-4">
          <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {document.victim ? <User size={12} /> : document.vehicle ? <Car size={12} /> : <FolderClosed size={12} />}
            {document.victim ? 'Linked Victim' : document.vehicle ? 'Linked Vehicle' : 'Case-Level Document'}
          </p>

          {document.victim ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FieldRow icon={User} label="Name" value={document.victim.name} />
              <FieldRow icon={User} label="Age / Gender" value={`${document.victim.age ?? '—'} yrs · ${document.victim.gender || '—'}`} />
              <FieldRow icon={User} label="Mobile" value={document.victim.mobile} />
              <FieldRow icon={User} label="Address" value={document.victim.address} />
            </div>
          ) : document.vehicle ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FieldRow icon={Car} label="Registration Number" value={document.vehicle.registrationNumber} />
              <FieldRow icon={Car} label="Vehicle Type" value={document.vehicle.vehicleType} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">Belongs to case <span className="font-medium text-slate-700">{document.case?.caseNumber}</span> directly, not to a specific victim or vehicle.</p>
          )}
        </div>

        {/* File preview */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">File Preview</p>
          {!document.fileUpload ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
              <FolderClosed className="text-slate-300" size={22} />
              <p className="text-sm italic text-slate-300">No file has been uploaded for this document yet.</p>
            </div>
          ) : fileLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-border py-10 text-sm text-slate-400">
              <Loader2 className="animate-spin" size={16} /> Loading preview...
            </div>
          ) : fileError ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-8 text-sm text-danger">
              <AlertCircle size={16} /> {fileError}
            </div>
          ) : isPdf ? (
            <iframe src={fileUrl} title="Document preview" className="h-[560px] w-full rounded-xl border border-border" />
          ) : isImage ? (
            <img src={fileUrl} alt="Document preview" className="mx-auto max-h-[560px] rounded-xl border border-border object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border py-8 text-center">
              <p className="text-sm text-slate-500">Preview isn't available for this file type.</p>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                <Download size={14} /> Download to view
              </a>
            </div>
          )}
          {document.fileUpload && (
            <p className="mt-2 text-xs text-slate-400">
              {document.fileUpload.originalName} · {formatBytes(document.fileUpload.fileSize)}
            </p>
          )}
        </div>

        {/* Verification */}
        <div className="border-t border-border pt-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Verification</p>
          {saveError && <div className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-danger">{saveError}</div>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-600">Status</span>
              <select className="input-base" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-600">
                Remarks {status === 'REJECTED' && <span className="text-danger">*</span>}
              </span>
              <textarea
                className="input-base"
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={status === 'REJECTED' ? 'Explain why this document is being rejected...' : 'Optional notes...'}
              />
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={goBack} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : (<span className="flex items-center gap-1.5"><Check size={15} /> Save Verification</span>)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}