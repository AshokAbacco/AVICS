// server.js

import express from 'express'
import cors from 'cors'
import config from './config/config.js'
import prisma from './config/prismaClient.js'
import routes from './src/index.js'
 

const app = express()

app.use(cors({ origin: config.corsOrigin }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// app.use(requestLogger)

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Accident Vehicle Insurance Claim Management System API',
    version: '1.0.0',
  })
})

app.use('/api', routes)

 app.use("/api", routes);

app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
});
 
export default app