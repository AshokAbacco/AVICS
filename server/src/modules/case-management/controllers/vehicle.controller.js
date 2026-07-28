import { validateVehiclePayload } from '../validators/vehicle.validator.js'
import {
  addVehicle, updateVehicle, listVehiclesForCase, deleteVehicle,
} from '../services/vehicle.service.js'

// POST /api/cases/:caseId/vehicles  — called once per vehicle card
export const createVehicle = async (req, res, next) => {
  try {
    const { caseId } = req.params
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const missing = validateVehiclePayload(req.body)
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} required.`,
      })
    }

    const vehicle = await addVehicle({ caseId, payload: req.body, userId })
    return res.status(201).json({ success: true, data: vehicle })
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'A conflicting unique field already exists (e.g. policy number).' })
    }
    next(err)
  }
}

// PUT /api/cases/:caseId/vehicles/:vehicleId
export const editVehicle = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const vehicle = await updateVehicle({ vehicleId: req.params.vehicleId, payload: req.body, userId })
    return res.status(200).json({ success: true, data: vehicle })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' })
    }
    next(err)
  }
}

// GET /api/cases/:caseId/vehicles
export const listVehicles = async (req, res, next) => {
  try {
    const vehicles = await listVehiclesForCase(req.params.caseId)
    return res.status(200).json({ success: true, data: vehicles })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/cases/:caseId/vehicles/:vehicleId
export const removeVehicle = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    await deleteVehicle({ vehicleId: req.params.vehicleId, userId })
    return res.status(200).json({ success: true, message: 'Vehicle removed successfully.' })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' })
    }
    next(err)
  }
}
