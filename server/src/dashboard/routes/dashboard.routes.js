// server/src/modules/dashboard/routes/dashboard.routes.js
import express from 'express'
import { getSummary } from '../controllers/dashboard.controller.js'

const router = express.Router()

// GET /api/dashboard/summary
router.get('/summary', getSummary)

export default router