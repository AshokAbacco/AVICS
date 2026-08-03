import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Matches devAuth.middleware.js's DEV_USERS ids exactly — Case.createdById /
// assignedOfficerId are live foreign keys, so these ids must resolve to
// real User rows or every case-creation call fails with a FK error.
// Passwords here also make POST /users/login usable for real, since there
// was previously no seeded user to actually log in with.
const USER_SEED = [
  {
    id: 'dev-admin-user-001',
    name: 'Admin User',
    email: 'admin@avics.local',
    password: 'Admin@123',
    role: 'Administrator',
    department: 'Administration',
    status: 'ACTIVE',
  },
  {
    id: 'dev-agent-user-001',
    name: 'Agent User',
    email: 'agent@avics.local',
    password: 'Agent@123',
    role: 'Agent',
    department: 'Case Management',
    status: 'ACTIVE',
  },
]

async function seedUsers() {
  for (const u of USER_SEED) {
    const hashedPassword = await bcrypt.hash(u.password, 10)
    await prisma.user.upsert({
      where: { id: u.id },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        department: u.department,
        status: u.status,
      },
      update: {
        // Re-running the seed shouldn't silently reset a password someone
        // already changed via the real app — only sync the non-secret fields.
        name: u.name,
        role: u.role,
        department: u.department,
        status: u.status,
      },
    })
  }
  console.log(`Seeded ${USER_SEED.length} users.`)
  console.log('Login credentials (change these before production):')
  USER_SEED.forEach((u) => console.log(`  ${u.role}: ${u.email} / ${u.password}`))
}

async function main() {
  await seedUsers()
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })