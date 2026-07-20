const express = require('express')
const healthRoutes = require('./healthRoutes')

const router = express.Router()

router.use('/', healthRoutes)

// Future route modules to be mounted here as APIs are implemented:
// router.use('/cases', require('./caseRoutes'))
// router.use('/victims', require('./victimRoutes'))
// router.use('/vehicles', require('./vehicleRoutes'))
// router.use('/hospitals', require('./hospitalRoutes'))
// router.use('/police', require('./policeRoutes'))
// router.use('/court', require('./courtRoutes'))
// router.use('/advocates', require('./advocateRoutes'))
// router.use('/documents', require('./documentRoutes'))
// router.use('/compensation', require('./compensationRoutes'))
// router.use('/users', require('./userRoutes'))

module.exports = router
