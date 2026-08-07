// src/components/CaseStatusBadge/CaseStatusBadge.jsx
import React from 'react'
import { getCaseStatusMeta } from '../../constants/caseStatus.js'

export default function CaseStatusBadge({ status }) {
  const { label, className } = getCaseStatusMeta(status)
  return <span className={`badge ${className}`}>{label}</span>
}