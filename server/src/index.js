import express from 'express'
// import healthRoutes from './healthRoutes.js'
import userRoutes from "./auth/userRoutes.js";
import victimsRoutes from './victims/victims.routes.js'
import claimsRoutes from './claims/claims.routes.js'
import caseRoutes from './case-management/routes/case.routes.js'
const router = express.Router()

// router.use('/', healthRoutes)
router.use('/users', userRoutes)
router.use('/victims', victimsRoutes)
router.use('/claims', claimsRoutes)
router.use('/cases', caseRoutes)

export default router