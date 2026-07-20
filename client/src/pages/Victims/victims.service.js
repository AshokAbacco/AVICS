const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/victims`

async function handleResponse(res) {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.message || 'Something went wrong')
  }
  return body.data
}

export const victimsService = {
  // GET /api/victims
  getAll: async () => {
    const res = await fetch(BASE_URL)
    return handleResponse(res)
  },

  // GET /api/victims/:id
  getById: async (id) => {
    const res = await fetch(`${BASE_URL}/${id}`)
    return handleResponse(res)
  },

  // POST /api/victims
  create: async (data) => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  // PUT /api/victims/:id
  update: async (id, data) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  // DELETE /api/victims/:id
  remove: async (id) => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
    return handleResponse(res)
  },
}