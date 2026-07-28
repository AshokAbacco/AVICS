import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { CASE_DETAIL_TABS } from '../../../constants/caseSteps.js'
import { getCaseStatusMeta } from '../../../constants/caseStatus.js'
import { getCaseById } from '../services/caseWizardService.js'

import AccidentTab from './tabs/AccidentTab.jsx'
import VictimTab from './tabs/VictimTab.jsx'
import VehicleTab from './tabs/VehicleTab.jsx'
import MedicalTab from './tabs/MedicalTab.jsx'
import PoliceTab from './tabs/PoliceTab.jsx'
import LegalTab from './tabs/LegalTab.jsx'
import DocumentsTab from './tabs/DocumentsTab.jsx'
import TimelineTab from './tabs/TimelineTab.jsx'
import RemarksTab from './tabs/RemarksTab.jsx'

const TAB_COMPONENTS = {
  accident: AccidentTab,
  victim: VictimTab,
  vehicle: VehicleTab,
  medical: MedicalTab,
  police: PoliceTab,
  legal: LegalTab,
  documents: DocumentsTab,
  timeline: TimelineTab,
  remarks: RemarksTab,
}

export default function CaseDetails() {
  const { id: caseId, tab: tabParam } = useParams()
  const navigate = useNavigate()
  const tab = tabParam || 'accident'

  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(() => {
    setLoading(true)
    getCaseById(caseId)
      .then(setCaseData)
      .catch(() => setCaseData(null))
      .finally(() => setLoading(false))
  }, [caseId])

  useEffect(() => { refetch() }, [refetch])

  if (loading) {
    return <div className="card p-8 text-center text-sm text-slate-400">Loading case...</div>
  }

  if (!caseData) {
    return <div className="card p-8 text-center text-sm text-slate-400">Case not found.</div>
  }

  const statusMeta = getCaseStatusMeta(caseData.status)
  const TabComponent = TAB_COMPONENTS[tab] || AccidentTab

  return (
    <div>
      {/* Back to listing */}
      <button
        onClick={() => navigate('/cases')}
        className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary"
      >
        <ArrowLeft size={16} /> Back to Cases
      </button>

      {/* Case Summary Card */}
      <div className="card mb-5 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{caseData.caseNumber}</h1>
            <p className="text-sm text-slate-400">
              {caseData.victims?.[0]?.name || 'No victim'} · {caseData.accident?.district || '—'} ·{' '}
              {caseData.accident?.accidentDate ? new Date(caseData.accident.accidentDate).toLocaleDateString('en-IN') : '—'}
            </p>
          </div>
          <span className={`badge w-fit ${statusMeta.className}`}>{statusMeta.label}</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
        {CASE_DETAIL_TABS.map((t) => (
          <button
            key={t.slug}
            onClick={() => navigate(`/cases/${caseId}/${t.slug}`)}
            className={`shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors
              ${tab === t.slug ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t.shortLabel}
          </button>
        ))}
      </div>

      <TabComponent caseId={caseId} caseData={caseData} refetch={refetch} />
    </div>
  )
}