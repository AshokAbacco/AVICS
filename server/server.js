const express = require('express')
const cors = require('cors')
const config = require('./config/config')
const routes = require('./routes')
const requestLogger = require('./middleware/requestLogger')
const { errorHandler, notFound } = require('./middleware/errorHandler')
const logger = require('./utils/logger')

const app = express()

// Core middleware
app.use(cors({ origin: config.corsOrigin }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Accident Vehicle Insurance Claim Management System API',
    version: '1.0.0',
  })
})

// API routes
app.use('/api', routes)

// 404 + error handling
app.use(notFound)
app.use(errorHandler)

app.listen(config.port, () => {
  logger.info(`AVICS backend server running on port ${config.port} [${config.nodeEnv}]`)
})

module.exports = app
