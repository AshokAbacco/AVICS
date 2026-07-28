function isMissing(value) {
  return value === undefined || value === null || value === ''
}

// mobile and aadhaarNumber both stay optional per our schema decision —
// only name/age/gender are hard requirements here.
export function validateVictimPayload(body) {
  const { name, age, gender } = body
  const errors = []

  if (isMissing(name)) errors.push('Victim Name')
  if (isMissing(age) || isNaN(Number(age))) errors.push('Age')
  if (isMissing(gender)) errors.push('Gender')

  return errors
}
