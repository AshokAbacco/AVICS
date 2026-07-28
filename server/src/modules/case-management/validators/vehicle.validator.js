function isMissing(value) {
  return value === undefined || value === null || value === ''
}

export function validateVehiclePayload(body) {
  const { registrationNumber, vehicleType, ownerName, insuranceCompany, policyNumber } = body
  const errors = []

  if (isMissing(registrationNumber)) errors.push('Vehicle Number')
  if (isMissing(vehicleType)) errors.push('Vehicle Type')
  if (isMissing(ownerName)) errors.push('Owner Name')
  if (isMissing(insuranceCompany)) errors.push('Insurance Company')
  if (isMissing(policyNumber)) errors.push('Policy Number')

  return errors
}
