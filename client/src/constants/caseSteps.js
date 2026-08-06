// Order matters — this drives both the wizard's Next/Previous flow and the
// progress bar segments. slug is used in the URL: /cases/new/:caseId/:slug
export const CASE_STEPS = [
  { slug: 'accident', label: 'Accident Details', shortLabel: 'Accident' },
  { slug: 'victim', label: 'Victim Details', shortLabel: 'Victim' },
  { slug: 'vehicle', label: 'Vehicle & Insurance', shortLabel: 'Vehicle' },
  { slug: 'medical', label: 'Medical Details', shortLabel: 'Medical' },
  { slug: 'police', label: 'Police Details', shortLabel: 'Police' },
  { slug: 'legal', label: 'Legal / MVC Details', shortLabel: 'Legal' },
  { slug: 'documents', label: 'Documents', shortLabel: 'Documents' },
  { slug: 'review', label: 'Review & Submit', shortLabel: 'Review' },
]

export const getStepIndex = (slug) => CASE_STEPS.findIndex((s) => s.slug === slug)
export const getStepBySlug = (slug) => CASE_STEPS.find((s) => s.slug === slug)
export const getNextStepSlug = (slug) => CASE_STEPS[getStepIndex(slug) + 1]?.slug ?? null
export const getPreviousStepSlug = (slug) => CASE_STEPS[getStepIndex(slug) - 1]?.slug ?? null

// Same set of sections, reused as the Case Details tab bar (plus Timeline/Remarks).
export const CASE_DETAIL_TABS = [
  ...CASE_STEPS.filter((s) => s.slug !== 'review'),
  { slug: 'timeline', label: 'Timeline', shortLabel: 'Timeline' },
  { slug: 'remarks', label: 'Remarks', shortLabel: 'Remarks' },
]
