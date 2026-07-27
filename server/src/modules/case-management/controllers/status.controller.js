import {
  submitCase, updateStatus, assignCase, closeCase, reopenCase,
} from '../services/status.service.js'

function handleStatusError(err, res, next) {
  if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message })
  next(err)
}

// PUT /api/cases/:caseId/submit  (Step 8 — Review & Submit)
export const submit = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const updatedCase = await submitCase({ caseId: req.params.caseId, userId })
    return res.status(200).json({ success: true, data: updatedCase })
  } catch (err) {
    handleStatusError(err, res, next)
  }
}

// PUT /api/cases/:caseId/status   body: { status, remarks }
export const changeStatus = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const { status, remarks } = req.body
    if (!status) return res.status(400).json({ success: false, message: 'status is required.' })

    const updatedCase = await updateStatus({ caseId: req.params.caseId, newStatus: status, userId, remarks })
    return res.status(200).json({ success: true, data: updatedCase })
  } catch (err) {
    handleStatusError(err, res, next)
  }
}

// PUT /api/cases/:caseId/assign   body: { assignedTo, remarks }
export const assign = async (req, res, next) => {
  try {
    const assignedBy = req.user?.id
    if (!assignedBy) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const { assignedTo, remarks } = req.body
    if (!assignedTo) return res.status(400).json({ success: false, message: 'assignedTo is required.' })

    const updatedCase = await assignCase({ caseId: req.params.caseId, assignedTo, assignedBy, remarks })
    return res.status(200).json({ success: true, data: updatedCase })
  } catch (err) {
    handleStatusError(err, res, next)
  }
}

// PUT /api/cases/:caseId/close   body: { remarks }
export const close = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const updatedCase = await closeCase({ caseId: req.params.caseId, userId, remarks: req.body.remarks })
    return res.status(200).json({ success: true, data: updatedCase })
  } catch (err) {
    handleStatusError(err, res, next)
  }
}

// PUT /api/cases/:caseId/reopen   body: { remarks }
export const reopen = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const updatedCase = await reopenCase({ caseId: req.params.caseId, userId, remarks: req.body.remarks })
    return res.status(200).json({ success: true, data: updatedCase })
  } catch (err) {
    handleStatusError(err, res, next)
  }
}
