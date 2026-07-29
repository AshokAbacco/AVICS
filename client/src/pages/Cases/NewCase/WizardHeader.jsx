//client\src\pages\Cases\NewCase\WizardHeader.jsx
import React from 'react'
import { Check, X } from 'lucide-react'
import { CASE_STEPS } from '../../../constants/caseSteps.js'
import Button from '../../../components/Button.jsx'

export default function WizardHeader({ currentStepIndex, caseNumber, onExit, onSaveDraft, saving = false }) {
  return (
    <div className="card mb-5 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">New Case</h2>
          <p className="text-sm text-slate-400">
            {caseNumber ? `Case Number: ${caseNumber}` : 'Case number will be generated after Step 1'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSaveDraft} disabled={saving}>
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <button
            onClick={onExit}
            aria-label="Exit wizard"
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Progress bar: full labels on md+, compact dots-only on mobile */}
      <div className="flex items-center overflow-x-auto pb-1">
        {CASE_STEPS.map((s, index) => {
          const isDone = index < currentStepIndex
          const isActive = index === currentStepIndex

          return (
            <div key={s.slug} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold
                    ${isDone ? 'bg-primary text-white' : isActive ? 'bg-primary-50 text-primary ring-2 ring-primary' : 'bg-slate-100 text-slate-400'}`}
                >
                  {isDone ? <Check size={14} /> : index + 1}
                </div>
                <span className={`hidden text-[11px] font-medium sm:block ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                  {s.shortLabel}
                </span>
              </div>

              {index < CASE_STEPS.length - 1 && (
                <div className={`mx-1.5 h-0.5 flex-1 rounded ${isDone ? 'bg-primary' : 'bg-slate-100'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}