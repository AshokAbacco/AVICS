import { validateAccidentPayload } from '../validators/accident.validator.js'
import { createCaseWithAccident, updateAccident, getAccidentByCaseId } from '../services/accident.service.js'

// POST /api/cases  (Step 1 — also creates the Case + generates the case number)
export const createCase = async (req, res, next) => {
  try {
    const missing = validateAccidentPayload(req.body)
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} required.`,
      })
    }

    // Auth middleware (see AuthContext re-enable plan) should attach req.user.
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' })
    }

    const result = await createCaseWithAccident({ userId, payload: req.body })
    return res.status(201).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// PUT /api/cases/:caseId/accident
export const updateAccidentDetails = async (req, res, next) => {
  try {
    const { caseId } = req.params
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' })
    }

    const accident = await updateAccident({ caseId, payload: req.body, userId })
    return res.status(200).json({ success: true, data: accident })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Case not found.' })
    }
    next(err)
  }
}

// GET /api/cases/:caseId/accident
export const getAccident = async (req, res, next) => {
  try {
    const { caseId } = req.params
    const accident = await getAccidentByCaseId(caseId)
    if (!accident) {
      return res.status(404).json({ success: false, message: 'Accident details not found.' })
    }
    return res.status(200).json({ success: true, data: accident })
  } catch (err) {
    next(err)
  }
}
