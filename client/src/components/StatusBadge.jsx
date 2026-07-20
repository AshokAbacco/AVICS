import React from 'react'
import { getStatusStyle } from '../constants/status.js'

export default function StatusBadge({ status }) {
  return <span className={`badge ${getStatusStyle(status)}`}>{status}</span>
}
