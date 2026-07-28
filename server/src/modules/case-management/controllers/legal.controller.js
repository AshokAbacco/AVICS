import { saveLegalDetail, getLegalDetailByCaseId } from '../services/legal.service.js'

// PUT /api/cases/:caseId/legal  (upsert — same endpoint for create + edit)
export const upsertLegalDetail = async (req, res, next) => {
  try {
    const { caseId } = req.params
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const legalDetail = await saveLegalDetail({ caseId, payload: req.body, userId })
    return res.status(200).json({ success: true, data: legalDetail })
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'This MVC Number is already in use.' })
    }
    next(err)
  }
}

// GET /api/cases/:caseId/legal
export const getLegalDetail = async (req, res, next) => {
  try {
    const legalDetail = await getLegalDetailByCaseId(req.params.caseId)
    if (!legalDetail) return res.status(404).json({ success: false, message: 'Legal details not found.' })
    return res.status(200).json({ success: true, data: legalDetail })
  } catch (err) {
    next(err)
  }
}
