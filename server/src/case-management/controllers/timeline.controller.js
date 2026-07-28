import prisma from '../../../config/prismaClient.js'

// GET /api/cases/:caseId/timeline
export const listTimeline = async (req, res, next) => {
  try {
    const timeline = await prisma.timeline.findMany({
      where: { caseId: req.params.caseId, deletedAt: null },
      include: { creator: { select: { id: true, name: true } } },
      orderBy: { eventDate: 'asc' },
    })
    return res.status(200).json({ success: true, data: timeline })
  } catch (err) {
    next(err)
  }
}
