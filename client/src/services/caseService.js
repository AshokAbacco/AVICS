import api from './api.js'
import { CASES } from '../data/cases.js'

// NOTE: The backend currently exposes no live endpoints. These service
// functions are wired to call the API but gracefully fall back to local
// dummy data so the UI works fully standalone.

export const caseService = {
  async getAll() {
    try {
      const res = await api.get('/cases')
      return res.data
    } catch {
      return CASES
    }
  },
}

export default caseService
