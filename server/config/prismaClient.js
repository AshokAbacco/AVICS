import { PrismaClient } from '@prisma/client'

// Reuse a single PrismaClient instance across the app instead of creating a
// new one per request/module import (avoids exhausting DB connections,
// especially important with nodemon's hot-reloads in dev).
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})

export default prisma