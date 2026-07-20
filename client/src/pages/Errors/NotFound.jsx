import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import Button from '../../components/Button.jsx'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary">
        <FileQuestion size={30} />
      </div>
      <h1 className="text-3xl font-bold text-slate-800">404 — Page Not Found</h1>
      <p className="max-w-sm text-sm text-slate-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  )
}
