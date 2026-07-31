// client/src/pages/Documents/services/documentService.js
import api from '../../../services/api.js'

export const listDocuments = (params) => api.get('/documents', { params }).then((r) => r.data.data)

export const getDocument = (documentId) => api.get(`/documents/${documentId}`).then((r) => r.data.data)

export const getDownloadUrl = (documentId) => api.get(`/documents/${documentId}/download`).then((r) => r.data.data.url)

export const verifyDocument = (documentId, payload) => api.put(`/documents/${documentId}/verify`, payload).then((r) => r.data.data)