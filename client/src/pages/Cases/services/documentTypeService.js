// client/src/pages/Cases/services/documentTypeService.js
import api from '../../../services/api.js'

export const getDocumentTypes = () => api.get('/document-types').then((r) => r.data.data)

export const createDocumentType = (payload) => api.post('/document-types', payload).then((r) => r.data.data)

export const updateDocumentType = (id, payload) => api.put(`/document-types/${id}`, payload).then((r) => r.data.data)

export const deleteDocumentType = (id) => api.delete(`/document-types/${id}`).then((r) => r.data)