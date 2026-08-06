import express from 'express'
import {
  createVictim,
  getVictims,
  getVictimById,
  updateVictim,
  deleteVictim,
} from './victims.controller.js'

const router = express.Router()

router.post('/', createVictim)
router.get('/', getVictims)
router.get('/:id', getVictimById)
router.put('/:id', updateVictim)
router.delete('/:id', deleteVictim)

export default router