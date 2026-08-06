function isMissing(value) {
  return value === undefined || value === null || value === ''
}

// Only the fields the client spec actually lists as required for Step 1.
// village/location/accidentType are optional per our schema decision.
export function validateAccidentPayload(body) {
  const { accidentDate, accidentTime, district, policeStation } = body
  const errors = []

  if (isMissing(accidentDate)) errors.push('Accident Date')
  if (isMissing(accidentTime)) errors.push('Approx. Time')
  if (isMissing(district)) errors.push('District')
  if (isMissing(policeStation)) errors.push('Police Station')

  return errors
}
