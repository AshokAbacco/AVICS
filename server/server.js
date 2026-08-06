// server.js

import express from 'express'
import cors from 'cors'
import config from './config/config.js'
import prisma from './config/prismaClient.js'
import routes from './src/index.js'
import { devAuth } from './src/middleware/devAuth.middleware.js'

const app = express()

app.use(cors({ origin: config.corsOrigin }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// app.use(requestLogger)

// TEMPORARY — attaches a real seeded user (admin or agent) to every
// request so req.user.id resolves to a valid User row. Delete this line
// (and src/middleware/devAuth.middleware.js) once real login/JWT auth
// replaces it — see that file's header comment for details.
app.use(devAuth)

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Accident Vehicle Insurance Claim Management System API',
    version: '1.0.0',
  })
})

app.use('/api', routes)


app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
});

export default app
