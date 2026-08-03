import express from 'express'
import {
  createInsurance,
  getInsurances,
  getInsuranceById,
  updateInsurance,
  deleteInsurance,
} from './insurance.controller.js'

const router = express.Router()

router.post('/', createInsurance)
router.get('/', getInsurances)
router.get('/:id', getInsuranceById)
router.put('/:id', updateInsurance)
router.delete('/:id', deleteInsurance)

export default router