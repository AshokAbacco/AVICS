const logger = require('../utils/logger')

// Central error handler. No business logic / APIs are implemented yet —
// this simply ensures the server responds consistently to any error
// thrown from future route handlers.
function errorHandler(err, req, res, next) {
  logger.error(err.message)
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
}

// 404 handler for unmatched routes.
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
}

module.exports = { errorHandler, notFound }
