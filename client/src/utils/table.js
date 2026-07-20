export const paginate = (items, page, pageSize) => {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export const filterBySearch = (items, query, keys) => {
  if (!query) return items
  const lower = query.toLowerCase()
  return items.filter((item) =>
    keys.some((key) => String(item[key] ?? '').toLowerCase().includes(lower))
  )
}

export const filterByField = (items, field, value) => {
  if (!value || value === 'All') return items
  return items.filter((item) => item[field] === value)
}

export const exportToCSV = (items, filename = 'export.csv') => {
  if (!items?.length) return
  const headers = Object.keys(items[0])
  const rows = items.map((item) => headers.map((h) => `"${String(item[h] ?? '').replace(/"/g, '""')}"`).join(','))
  const csvContent = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
