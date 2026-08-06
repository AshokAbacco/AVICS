// server/src/modules/dashboard/controllers/dashboard.controller.js
import { getDashboardSummary } from '../services/dashboard.service.js'

// GET /api/dashboard/summary
export const getSummary = async (req, res, next) => {
  try {
    const summary = await getDashboardSummary()
    return res.status(200).json({ success: true, data: summary })
  } catch (err) {
    next(err)
  }
}