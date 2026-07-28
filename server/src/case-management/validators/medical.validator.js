function isMissing(value) {
  return value === undefined || value === null || value === ''
}

export function validateMedicalPayload(body) {
  const { hospitalName } = body
  const errors = []

  if (isMissing(hospitalName)) errors.push('Hospital Name')

  return errors
}
