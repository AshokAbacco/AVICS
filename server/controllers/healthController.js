// Placeholder controller. No claim/case/victim APIs are implemented per the
// project requirements — this only exposes a health/status check so the
// Express server has something meaningful to serve out of the box.

const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AVICS backend server is running',
    timestamp: new Date().toISOString(),
  })
}

module.exports = { getHealthStatus }
