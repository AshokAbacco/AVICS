// client/src/pages/Users/services/userService.js
// Adjust the relative path below to your actual api client location —
// mirrors caseWizardService.js's pattern (services/api.js re-exported
// axios instance whose responses are shaped { success, data, message }).
import api from '../../../services/api.js'

export const getUsers = () => api.get('/users').then((r) => r.data.data)

export const createUser = (payload) => {
  if (!payload.password) {
    // Backend requires name/email/password on create (userController.js) —
    // fail fast client-side with a message ManagementPage will surface via
    // its existing window.alert(err.message) in onSubmit's catch block.
    throw new Error('Password is required to create a user.')
  }
  return api.post('/users', payload).then((r) => r.data.data)
}

// Password is optional on edit — leaving it blank keeps the current one
// (matches updateUser's `if (password) { ...hash... }` logic server-side).
export const updateUser = (id, payload) => {
  const { password, ...rest } = payload
  const data = password ? { ...rest, password } : rest
  return api.put(`/users/${id}`, data).then((r) => r.data.data)
}

export const deleteUser = (id) => api.delete(`/users/${id}`).then((r) => r.data)