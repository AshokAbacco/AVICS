import express from 'express'
import { createClaim, getClaims, getClaimById, updateClaim, deleteClaim } from './claims.controller.js'

const router = express.Router()

router.post('/', createClaim)
router.get('/', getClaims)
router.get('/:id', getClaimById)
router.put('/:id', updateClaim)
router.delete('/:id', deleteClaim)

export default router
