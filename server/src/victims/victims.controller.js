import prisma from '../../config/prismaClient.js'

function isMissing(value) {
  return value === undefined || value === null || value === ''
}

function validateVictimPayload(body) {
  const { name, age, gender, contact, injuryType } = body
  const errors = []

  if (isMissing(name)) errors.push('Name')
  if (isMissing(age) || isNaN(Number(age))) errors.push('Age')
  if (isMissing(gender)) errors.push('Gender')
  if (isMissing(contact)) errors.push('Contact')
  if (isMissing(injuryType)) errors.push('Injury Type')

  return errors
}

// POST /api/victims
export const createVictim = async (req, res) => {
  try {
    const {
      name,
      guardianRelation,
      guardianName,
      age,
      gender,
      contact,
      aadhaarNumber,
      address,
      caseId,
      injuryType,
      status,
    } = req.body

    const missing = validateVictimPayload(req.body)
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} required.`,
      })
    }

    const victim = await prisma.Victim.create({
      data: {
        name,
        guardianRelation: guardianRelation || null,
        guardianName: guardianName || null,
        age: Number(age),
        gender,
        contact,
        aadhaarNumber: aadhaarNumber || null,
        address: address || null,
        caseId: caseId || null,
        injuryType,
        status: status || 'Active',
      },
    })

    return res.status(201).json({ success: true, data: victim })
  } catch (error) {
    console.error('createVictim error:', error)
    return res.status(500).json({ success: false, message: 'Failed to create victim record.' })
  }
}

// GET /api/victims
export const getVictims = async (req, res) => {
  try {
    const victims = await prisma.victim.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json({ success: true, data: victims })
  } catch (error) {
    console.error('getVictims error:', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch victims.' })
  }
}

// GET /api/victims/:id
export const getVictimById = async (req, res) => {
  try {
    const { id } = req.params
    const victim = await prisma.victim.findUnique({ where: { id } })

    if (!victim) {
      return res.status(404).json({ success: false, message: 'Victim not found.' })
    }

    return res.status(200).json({ success: true, data: victim })
  } catch (error) {
    console.error('getVictimById error:', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch victim.' })
  }
}

// PUT /api/victims/:id
export const updateVictim = async (req, res) => {
  try {
    const { id } = req.params
    const data = { ...req.body }

    if (data.age !== undefined) {
      if (isNaN(Number(data.age))) {
        return res.status(400).json({ success: false, message: 'Age must be a valid number.' })
      }
      data.age = Number(data.age)
    }

    const victim = await prisma.victim.update({
      where: { id },
      data,
    })

    return res.status(200).json({ success: true, data: victim })
  } catch (error) {
    console.error('updateVictim error:', error)
    return res.status(500).json({ success: false, message: 'Failed to update victim.' })
  }
}

// DELETE /api/victims/:id
export const deleteVictim = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.victim.delete({ where: { id } })
    return res.status(200).json({ success: true, message: 'Victim deleted successfully.' })
  } catch (error) {
    console.error('deleteVictim error:', error)
    return res.status(500).json({ success: false, message: 'Failed to delete victim.' })
  }
}