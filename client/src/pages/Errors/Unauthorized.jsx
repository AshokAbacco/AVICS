import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import Button from '../../components/Button.jsx'

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-danger">
        <ShieldAlert size={30} />
      </div>
      <h1 className="text-3xl font-bold text-slate-800">403 — Unauthorized</h1>
      <p className="max-w-sm text-sm text-slate-500">
        You don't have the required permissions to view this page.
      </p>
      <Link to="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  )
}
