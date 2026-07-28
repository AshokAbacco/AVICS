// TEMPORARY — remove this file and its app.use() line in server.js the
// moment real login/JWT auth is wired up. It exists only so req.user.id
// resolves to a real row in the User table (createdById, assignedTo, etc.
// are live foreign keys — they can't point at a made-up id).
//
// Switch role by sending header:  x-dev-role: agent   (defaults to admin)
// Matches the two seeded users in prisma/seed.js.

const DEV_USERS = {
  admin: { id: 'dev-admin-user-001', role: 'Administrator' },
  agent: { id: 'dev-agent-user-001', role: 'Agent' },
}

export function devAuth(req, res, next) {
  const requestedRole = (req.headers['x-dev-role'] || 'admin').toLowerCase()
  req.user = DEV_USERS[requestedRole] || DEV_USERS.admin
  next()
}
