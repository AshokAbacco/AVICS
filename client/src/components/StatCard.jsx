import React from 'react'
import { motion } from 'framer-motion'

const TONE_STYLES = {
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  accent: 'bg-primary-50 text-primary-600',
}

export default function StatCard({ label, value, icon: Icon, tone = 'primary', trend, delay = 0 }) {
  return (
    <motion.div
      className="card p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
          {trend && <p className="mt-1 text-xs font-medium text-success">{trend}</p>}
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${TONE_STYLES[tone]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </motion.div>
  )
}