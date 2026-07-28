import prisma from '../../config/prismaClient.js'

export const getCases = async (req, res) => {
  try {
    const cases = await prisma.case.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json({ success: true, data: cases })
  } catch (error) {
    console.error('getCases error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cases.',
      error: error.message,
    })
  }
}

export const getCaseById = async (req, res) => {
  try {
    const { id } = req.params
    const caseRecord = await prisma.case.findUnique({ where: { id } })

    if (!caseRecord) {
      return res.status(404).json({ success: false, message: 'Case not found.' })
    }

    return res.status(200).json({ success: true, data: caseRecord })
  } catch (error) {
    console.error('getCaseById error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch case.',
      error: error.message,
    })
  }
}
