//client\src\pages\Cases\services\caseWizardService.js
import api from '../../../services/api.js'

// --- Step 1: Accident (also creates the Case) ---
export const createCase = (payload) => api.post('/cases', payload).then((r) => r.data.data)
export const updateAccident = (caseId, payload) => api.put(`/cases/${caseId}/accident`, payload).then((r) => r.data.data)
export const getAccident = (caseId) => api.get(`/cases/${caseId}/accident`).then((r) => r.data.data)

// --- Step 2: Victims ---
export const listVictims = (caseId) => api.get(`/cases/${caseId}/victims`).then((r) => r.data.data)
export const createVictim = (caseId, payload) => api.post(`/cases/${caseId}/victims`, payload).then((r) => r.data.data)
export const updateVictim = (caseId, victimId, payload) => api.put(`/cases/${caseId}/victims/${victimId}`, payload).then((r) => r.data.data)
export const deleteVictim = (caseId, victimId) => api.delete(`/cases/${caseId}/victims/${victimId}`).then((r) => r.data)

// --- Step 3: Vehicles & Insurance ---
export const listVehicles = (caseId) => api.get(`/cases/${caseId}/vehicles`).then((r) => r.data.data)
export const createVehicle = (caseId, payload) => api.post(`/cases/${caseId}/vehicles`, payload).then((r) => r.data.data)
export const updateVehicle = (caseId, vehicleId, payload) => api.put(`/cases/${caseId}/vehicles/${vehicleId}`, payload).then((r) => r.data.data)
export const deleteVehicle = (caseId, vehicleId) => api.delete(`/cases/${caseId}/vehicles/${vehicleId}`).then((r) => r.data)

// --- Step 4: Medical (nested under victim) ---
export const listMedical = (caseId, victimId) => api.get(`/cases/${caseId}/victims/${victimId}/medical`).then((r) => r.data.data)
export const createMedical = (caseId, victimId, payload) => api.post(`/cases/${caseId}/victims/${victimId}/medical`, payload).then((r) => r.data.data)
export const updateMedical = (caseId, victimId, medicalDetailId, payload) => api.put(`/cases/${caseId}/victims/${victimId}/medical/${medicalDetailId}`, payload).then((r) => r.data.data)

// --- Step 5: Police (upsert) ---
export const getPolice = (caseId) => api.get(`/cases/${caseId}/police`).then((r) => r.data.data)
export const savePolice = (caseId, payload) => api.put(`/cases/${caseId}/police`, payload).then((r) => r.data.data)

// --- Step 6: Legal / MVC (upsert) ---
export const getLegal = (caseId) => api.get(`/cases/${caseId}/legal`).then((r) => r.data.data)
export const saveLegal = (caseId, payload) => api.put(`/cases/${caseId}/legal`, payload).then((r) => r.data.data)

// --- Step 7: Documents ---
export const listDocuments = (caseId) => api.get(`/cases/${caseId}/documents`).then((r) => r.data.data)
export const uploadDocument = (caseId, documentId, file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post(`/cases/${caseId}/documents/${documentId}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.data)
}
export const replaceDocument = (caseId, documentId, file) => {
  const form = new FormData()
  form.append('file', file)
  return api.put(`/cases/${caseId}/documents/${documentId}/replace`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.data)
}
export const getDocumentDownloadUrl = (caseId, documentId) => api.get(`/cases/${caseId}/documents/${documentId}/download`).then((r) => r.data.data.url)
export const verifyDocument = (caseId, documentId, status, remarks) => api.put(`/cases/${caseId}/documents/${documentId}/verify`, { status, remarks }).then((r) => r.data.data)

// --- Step 8 + case-level actions ---
export const submitCase = (caseId) => api.put(`/cases/${caseId}/submit`).then((r) => r.data.data)
export const changeStatus = (caseId, status, remarks) => api.put(`/cases/${caseId}/status`, { status, remarks }).then((r) => r.data.data)
export const assignCase = (caseId, assignedTo, remarks) => api.put(`/cases/${caseId}/assign`, { assignedTo, remarks }).then((r) => r.data.data)
export const closeCase = (caseId, remarks) => api.put(`/cases/${caseId}/close`, { remarks }).then((r) => r.data.data)
export const reopenCase = (caseId, remarks) => api.put(`/cases/${caseId}/reopen`, { remarks }).then((r) => r.data.data)

// --- Case listing / details ---
export const getCases = (params) => api.get('/cases', { params }).then((r) => r.data)
export const getCaseById = (caseId) => api.get(`/cases/${caseId}`).then((r) => r.data.data)
export const deleteCase = (caseId) => api.delete(`/cases/${caseId}`).then((r) => r.data)

// --- Timeline & Remarks ---
export const getTimeline = (caseId) => api.get(`/cases/${caseId}/timeline`).then((r) => r.data.data)
export const getRemarks = (caseId) => api.get(`/cases/${caseId}/remarks`).then((r) => r.data.data)
export const addRemark = (caseId, note) => api.post(`/cases/${caseId}/remarks`, { note }).then((r) => r.data.data)
