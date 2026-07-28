import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { DOCUMENT_TYPE_SEED } from '../src/case-management/constants/documentChecklist.constants.js'

const prisma = new PrismaClient()

// Fixed, predictable IDs — referenced directly by the temporary dev-auth
// middleware (src/middleware/devAuth.middleware.js) until real login exists.
// Remove/replace these once JWT auth is wired up.
const DEV_USERS = [
  { id: 'dev-admin-user-001', name: 'Dev Admin', email: 'dev.admin@avics.local', role: 'Administrator' },
  { id: 'dev-agent-user-001', name: 'Dev Agent', email: 'dev.agent@avics.local', role: 'Agent' },
]

async function seedDevUsers() {
  const hashedPassword = await bcrypt.hash('DevPassword@123', 10)
  for (const user of DEV_USERS) {
    await prisma.user.upsert({
      where: { id: user.id },
      create: { ...user, password: hashedPassword },
      update: { name: user.name, role: user.role },
    })
  }
  console.log(`Seeded ${DEV_USERS.length} dev users (admin + agent).`)
}

async function main() {
  await seedDevUsers()

  for (const docType of DOCUMENT_TYPE_SEED) {
    await prisma.documentType.upsert({
      where: { name: docType.name },
      create: docType,
      update: { category: docType.category },
    })
  }
  console.log(`Seeded ${DOCUMENT_TYPE_SEED.length} document types.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
