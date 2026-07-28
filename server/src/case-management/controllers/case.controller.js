import { getAllCases, getCaseById, deleteCase } from '../services/case.service.js'

// GET /api/cases  — landing page listing, with search/filters/pagination
export const listCases = async (req, res, next) => {
  try {
    const result = await getAllCases(req.query)
    return res.status(200).json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

// GET /api/cases/:caseId — full nested fetch for Case Details / Review
export const getCase = async (req, res, next) => {
  try {
    const caseRecord = await getCaseById(req.params.caseId)
    if (!caseRecord) return res.status(404).json({ success: false, message: 'Case not found.' })
    return res.status(200).json({ success: true, data: caseRecord })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/cases/:caseId
export const removeCase = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    await deleteCase({ caseId: req.params.caseId, userId })
    return res.status(200).json({ success: true, message: 'Case deleted successfully.' })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Case not found.' })
    }
    next(err)
  }
}
