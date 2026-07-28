// Must always be called with the transaction client (tx), inside the same
// transaction that creates the Case row, so the sequence increment and the
// case creation commit or roll back together.
export async function generateCaseNumber(tx) {
  const year = new Date().getFullYear()
  const prefix = process.env.CASE_NUMBER_PREFIX || 'MVC'

  const sequence = await tx.caseSequence.upsert({
    where: { year },
    create: { year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  })

  const padded = String(sequence.lastNumber).padStart(6, '0')
  return `${prefix}-${year}-${padded}`
}
