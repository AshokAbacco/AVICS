import { useParams, useNavigate } from 'react-router-dom'
import { CASE_STEPS, getStepIndex, getNextStepSlug, getPreviousStepSlug } from '../../../constants/caseSteps.js'
import { createCase } from '../services/caseWizardService.js'

export default function useCaseWizard() {
  const { caseId, step: stepParam } = useParams()

  // /cases/new has no :step param yet (no caseId exists to route on) — the
  // only step reachable before a case exists is Step 1, so default to it.
  const step = stepParam || 'accident'

  const navigate = useNavigate()

  const currentStepIndex = getStepIndex(step)
  const isFirstStep = currentStepIndex <= 0
  const isLastStep = currentStepIndex === CASE_STEPS.length - 1

  const goToStep = (slug, targetCaseId = caseId) => {
    navigate(`/cases/new/${targetCaseId}/${slug}`)
  }

  const goNext = () => {
    const nextSlug = getNextStepSlug(step)
    if (nextSlug) goToStep(nextSlug)
  }

  const goPrevious = () => {
    const prevSlug = getPreviousStepSlug(step)
    if (prevSlug) goToStep(prevSlug)
  }

  // Step 1 only — creates the Case + Accident together, then advances the
  // URL to /cases/new/:newCaseId/victim so every later step has a caseId.
  const startCase = async (payload) => {
    const result = await createCase(payload)
    const newCaseId = result.case.id
    goToStep('victim', newCaseId)
    return result
  }

  const exitToListing = () => navigate('/cases')

  return {
    caseId, step, currentStepIndex, isFirstStep, isLastStep,
    goToStep, goNext, goPrevious, startCase, exitToListing,
  }
}