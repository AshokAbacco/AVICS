import express from 'express'
// import healthRoutes from './healthRoutes.js'
import userRoutes from "./auth/userRoutes.js";
import victimsRoutes from './victims/victims.routes.js'
const router = express.Router()

// router.use('/', healthRoutes)
router.use('/users', userRoutes)
router.use('/victims', victimsRoutes)

// Future route modules, e.g.:
// import caseRoutes from './caseRoutes.js'
// router.use('/cases', caseRoutes)

export default router