import prisma from '../../../config/prismaClient.js'

// GET /api/cases/:caseId/remarks
export const listRemarks = async (req, res, next) => {
  try {
    const remarks = await prisma.caseNote.findMany({
      where: { caseId: req.params.caseId, deletedAt: null },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json({ success: true, data: remarks })
  } catch (err) {
    next(err)
  }
}

// POST /api/cases/:caseId/remarks   body: { note }
export const addRemark = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' })

    const { note } = req.body
    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Remark text is required.' })
    }

    const remark = await prisma.caseNote.create({
      data: { caseId: req.params.caseId, userId, note: note.trim() },
      include: { user: { select: { id: true, name: true } } },
    })
    return res.status(201).json({ success: true, data: remark })
  } catch (err) {
    next(err)
  }
}

// PUT /api/cases/:caseId/remarks/:remarkId   body: { note }
export const editRemark = async (req, res, next) => {
  try {
    const { note } = req.body
    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Remark text is required.' })
    }
    const remark = await prisma.caseNote.update({
      where: { id: req.params.remarkId },
      data: { note: note.trim() },
    })
    return res.status(200).json({ success: true, data: remark })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Remark not found.' })
    }
    next(err)
  }
}
