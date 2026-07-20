export const formatCurrency = (value) => {
  if (value === 0 || value === '-') return '\u20B9 0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '-') return '-'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const truncate = (text, length = 30) => {
  if (!text) return ''
  return text.length > length ? `${text.slice(0, length)}...` : text
}

export const getInitials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
