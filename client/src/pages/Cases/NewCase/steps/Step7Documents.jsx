import React, { useEffect, useRef, useState } from 'react'
import { Upload, Download, CheckCircle2, XCircle } from 'lucide-react'
import Select from '../../../../components/Select.jsx'
import WizardNavButtons from '../WizardNavButtons.jsx'
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
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-3 text-sm text-slate-700">{doc.documentType?.name}</td>
      <td className="py-3 pr-3 text-sm">
        {doc.received ? (
          <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 size={14} /> Yes</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-slate-400"><XCircle size={14} /> No</span>
        )}
      </td>
      <td className="py-3 pr-3 text-sm text-slate-500">{formatDate(doc.receivedDate)}</td>
      <td className="py-3 pr-3">
        <Select
          value={doc.verified}
          onChange={handleVerifyChange}
          options={VERIFY_OPTIONS}
          className="!py-1.5 text-xs"
        />
      </td>
      <td className="py-3 pr-3">
        <div className="flex items-center gap-1">
          <label className={`cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-primary-50 hover:text-primary ${busy ? 'pointer-events-none opacity-50' : ''}`}>
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
  return (
    <div className="card mb-4 p-4 sm:p-6">
      <h4 className="mb-4 text-sm font-semibold text-slate-700">{title} ({documents.length})</h4>
      {documents.length === 0 ? (
        <p className="text-sm text-slate-400">No documents in this checklist yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-slate-400">
                <th className="pb-2 pr-3 font-medium">Document</th>
                <th className="pb-2 pr-3 font-medium">Received</th>
                <th className="pb-2 pr-3 font-medium">Received Date</th>
                <th className="pb-2 pr-3 font-medium">Verified</th>
                <th className="pb-2 pr-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <DocumentRow key={doc.id} doc={{ ...doc, caseId: doc.caseId }} onUploaded={onUploaded} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function Step7Documents({ wizard }) {
  const { caseId, isFirstStep, goPrevious, goNext } = wizard

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  const loadDocuments = () => {
    setLoading(true)
    listDocuments(caseId)
      .then((data) => setDocuments(data.map((d) => ({ ...d, caseId }))))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (caseId) loadDocuments()
  }, [caseId])

  const handleRowUpdated = (updatedDoc) => {
    setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? { ...d, ...updatedDoc } : d)))
  }

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-slate-400">Loading document checklist...</p>
      </div>
    )
  }

  const caseAndVictimDocs = documents.filter((d) => d.documentType?.category !== 'VEHICLE')
  const vehicleDocs = documents.filter((d) => d.documentType?.category === 'VEHICLE')

  return (
    <>
      <DocumentTable title="Case & Victim Documents" documents={caseAndVictimDocs} onUploaded={handleRowUpdated} />
      <DocumentTable title="Vehicle Documents" documents={vehicleDocs} onUploaded={handleRowUpdated} />

      <WizardNavButtons isFirstStep={isFirstStep} isLastStep={false} onPrevious={goPrevious} onNext={goNext} />
    </>
  )
}