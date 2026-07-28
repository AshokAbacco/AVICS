import React, { useEffect, useState } from 'react'
import useCaseWizard from '../hooks/useCaseWizard.js'
import { getCaseById } from '../services/caseWizardService.js'
import WizardHeader from './WizardHeader.jsx'

import Step1Accident from './steps/Step1Accident.jsx'
import Step2Victim from './steps/Step2Victim.jsx'
import Step3VehicleInsurance from './steps/Step3VehicleInsurance.jsx'
import Step4Medical from './steps/Step4Medical.jsx'
import Step5Police from './steps/Step5Police.jsx'
import Step6Legal from './steps/Step6Legal.jsx'
import Step7Documents from './steps/Step7Documents.jsx'
import Step8ReviewSubmit from './steps/Step8ReviewSubmit.jsx'

const STEP_COMPONENTS = {
  accident: Step1Accident,
  victim: Step2Victim,
  vehicle: Step3VehicleInsurance,
  medical: Step4Medical,
  police: Step5Police,
  legal: Step6Legal,
  documents: Step7Documents,
  review: Step8ReviewSubmit,
}

export default function NewCaseWizard() {
  const wizard = useCaseWizard()
  const { caseId, step, currentStepIndex, exitToListing } = wizard

  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!caseId) {
      setCaseData(null)
      return
    }
    setLoading(true)
    getCaseById(caseId)
      .then(setCaseData)
      .catch(() => setCaseData(null))
      .finally(() => setLoading(false))
  }, [caseId, step])

  const StepComponent = STEP_COMPONENTS[step] || STEP_COMPONENTS.accident

  return (
    <div className="mx-auto max-w-4xl">
      <WizardHeader
        currentStepIndex={Math.max(currentStepIndex, 0)}
        caseNumber={caseData?.caseNumber}
        onExit={exitToListing}
        onSaveDraft={() => {}}
      />

      {loading ? (
        <div className="card p-8 text-center text-sm text-slate-400">
          Loading case details...
        </div>
      ) : (
        <StepComponent wizard={wizard} caseData={caseData} />
      )}
    </div>
  )
}