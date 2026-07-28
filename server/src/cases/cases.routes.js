import express from 'express'
import { getCases, getCaseById } from './cases.controller.js'

const router = express.Router()

router.get('/', getCases)
router.get('/:id', getCaseById)

export default router
