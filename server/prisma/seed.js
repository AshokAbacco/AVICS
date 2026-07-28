import { PrismaClient } from '@prisma/client'
import { DOCUMENT_TYPE_SEED } from '../src/modules/case-management/constants/documentChecklist.constants.js'

const prisma = new PrismaClient()

async function main() {
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
