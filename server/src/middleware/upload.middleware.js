// Requires: npm install multer
import multer from 'multer'

const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png')
  .split(',')
  .map((t) => t.trim().toLowerCase())

const maxSizeBytes = Number(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024

const storage = multer.memoryStorage()

function fileFilter(req, file, cb) {
  const extension = file.originalname.split('.').pop().toLowerCase()
  if (!allowedTypes.includes(extension)) {
    return cb(new Error(`File type .${extension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`))
  }
  cb(null, true)
}

export const uploadSingleDocument = multer({
  storage,
  limits: { fileSize: maxSizeBytes },
  fileFilter,
}).single('file')

// Wraps multer's callback style so it plays nicely with express error middleware.
export function handleUpload(req, res, next) {
  uploadSingleDocument(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message })
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file was uploaded.' })
    }
    next()
  })
}
