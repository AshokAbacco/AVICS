// claimService.js

import api from './api.js'

export const claimService = {
  getAll: async () => {
    const res = await api.get('/claims')
    return res.data?.data || []
  },

  create: async (data) => {
    const res = await api.post('/claims', data)
    return res.data?.data
  },

  update: async (id, data) => {
    const res = await api.put(`/claims/${id}`, data)
    return res.data?.data
  },

  remove: async (id) => {
    await api.delete(`/claims/${id}`)
  },
}
