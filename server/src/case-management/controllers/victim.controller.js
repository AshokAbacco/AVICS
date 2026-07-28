import { validateVictimPayload } from '../validators/victim.validator.js'
import {
  addVictim, updateVictim, listVictimsForCase, getVictimById, deleteVictim,
} from '../services/victim.service.js'

// POST /api/cases/:caseId/victims
export const createVictim = async (req, res, next) => {
  try {
    const { caseId } = req.params
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const missing = validateVictimPayload(req.body)
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} required.`,
      })
    }

    const victim = await addVictim({ caseId, payload: req.body, userId })
    return res.status(201).json({ success: true, data: victim })
  } catch (err) {
    next(err)
  }
}

// PUT /api/cases/:caseId/victims/:victimId
export const editVictim = async (req, res, next) => {
  try {
    const { victimId } = req.params
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const victim = await updateVictim({ victimId, payload: req.body, userId })
    return res.status(200).json({ success: true, data: victim })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Victim not found.' })
    }
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message })
    }
    next(err)
  }
}

// GET /api/cases/:caseId/victims
export const listVictims = async (req, res, next) => {
  try {
    const victims = await listVictimsForCase(req.params.caseId)
    return res.status(200).json({ success: true, data: victims })
  } catch (err) {
    next(err)
  }
}

// GET /api/cases/:caseId/victims/:victimId
export const getVictim = async (req, res, next) => {
  try {
    const victim = await getVictimById(req.params.victimId)
    if (!victim) return res.status(404).json({ success: false, message: 'Victim not found.' })
    return res.status(200).json({ success: true, data: victim })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/cases/:caseId/victims/:victimId
export const removeVictim = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    await deleteVictim({ victimId: req.params.victimId, userId })
    return res.status(200).json({ success: true, message: 'Victim removed successfully.' })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Victim not found.' })
    }
    next(err)
  }
}
