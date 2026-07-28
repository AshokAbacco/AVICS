function isMissing(value) {
  return value === undefined || value === null || value === ''
}

export function validatePolicePayload(body) {
  const { firNumber, policeStation } = body
  const errors = []

  if (isMissing(firNumber)) errors.push('FIR Number')
  if (isMissing(policeStation)) errors.push('Police Station')

  return errors
}
