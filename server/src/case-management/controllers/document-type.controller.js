// server/src/case-management/controllers/document-type.controller.js
import {
  listDocumentTypes, createDocumentType, updateDocumentType, deleteDocumentType,
} from '../services/document-type.service.js'

const VALID_CATEGORIES = ['CASE', 'VICTIM', 'VEHICLE']

// GET /api/document-types
export const getDocumentTypes = async (req, res, next) => {
  try {
    const types = await listDocumentTypes()
    return res.status(200).json({ success: true, data: types })
  } catch (err) {
    next(err)
  }
}

// POST /api/document-types
export const addDocumentType = async (req, res, next) => {
  try {
    const { name, category, description, isMandatory } = req.body

    if (!name?.trim() || !category) {
      return res.status(400).json({ success: false, message: 'name and category are required.' })
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: `category must be one of ${VALID_CATEGORIES.join(', ')}.` })
    }

    const created = await createDocumentType({ name: name.trim(), category, description, isMandatory })
    return res.status(201).json({ success: true, data: created })
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'A document type with this name already exists.' })
    }
    next(err)
  }
}

// PUT /api/document-types/:id
export const editDocumentType = async (req, res, next) => {
  try {
    const { name, category, description, isMandatory } = req.body

    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: `category must be one of ${VALID_CATEGORIES.join(', ')}.` })
    }

    const updated = await updateDocumentType(req.params.id, {
      name: name?.trim(),
      category,
      description,
      isMandatory,
    })
    return res.status(200).json({ success: true, data: updated })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Document type not found.' })
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'A document type with this name already exists.' })
    }
    next(err)
  }
}

// DELETE /api/document-types/:id
export const removeDocumentType = async (req, res, next) => {
  try {
    await deleteDocumentType(req.params.id)
    return res.status(200).json({ success: true, message: 'Document type deleted successfully.' })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Document type not found.' })
    }
    // Document.documentTypeId is a required, non-cascading foreign key —
    // deleting a type already used by existing Document rows violates it.
    if (err.code === 'P2003') {
      return res.status(409).json({
        success: false,
        message: 'This document type is already used on existing cases and cannot be deleted.',
      })
    }
    next(err)
  }
}