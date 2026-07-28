import { validateMedicalPayload } from '../validators/medical.validator.js'
import { addMedicalDetail, updateMedicalDetail, listMedicalForVictim } from '../services/medical.service.js'

// POST /api/cases/:caseId/victims/:victimId/medical
export const createMedicalDetail = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const missing = validateMedicalPayload(req.body)
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} required.`,
      })
    }

    const medicalDetail = await addMedicalDetail({ victimId: req.params.victimId, payload: req.body, userId })
    return res.status(201).json({ success: true, data: medicalDetail })
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message })
    next(err)
  }
}

// PUT /api/cases/:caseId/victims/:victimId/medical/:medicalDetailId
export const editMedicalDetail = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const medicalDetail = await updateMedicalDetail({
      medicalDetailId: req.params.medicalDetailId, payload: req.body, userId,
    })
    return res.status(200).json({ success: true, data: medicalDetail })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Medical record not found.' })
    }
    next(err)
  }
}

// GET /api/cases/:caseId/victims/:victimId/medical
export const listMedical = async (req, res, next) => {
  try {
    const records = await listMedicalForVictim(req.params.victimId)
    return res.status(200).json({ success: true, data: records })
  } catch (err) {
    next(err)
  }
}
