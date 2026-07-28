import { validatePolicePayload } from '../validators/police.validator.js'
import { savePoliceDetail, getPoliceDetailByCaseId } from '../services/police.service.js'

// PUT /api/cases/:caseId/police  (upsert — same endpoint for create + edit)
export const upsertPoliceDetail = async (req, res, next) => {
  try {
    const { caseId } = req.params
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const missing = validatePolicePayload(req.body)
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} required.`,
      })
    }

    const policeDetail = await savePoliceDetail({ caseId, payload: req.body, userId })
    return res.status(200).json({ success: true, data: policeDetail })
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'This FIR Number is already in use.' })
    }
    next(err)
  }
}

// GET /api/cases/:caseId/police
export const getPoliceDetail = async (req, res, next) => {
  try {
    const policeDetail = await getPoliceDetailByCaseId(req.params.caseId)
    if (!policeDetail) return res.status(404).json({ success: false, message: 'Police details not found.' })
    return res.status(200).json({ success: true, data: policeDetail })
  } catch (err) {
    next(err)
  }
}
