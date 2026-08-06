// Every create/update/status-change on a case must be recorded in both the
// Timeline (human-readable feed) and the ActivityLog (audit trail). Call
// this once per action, inside the same transaction as the actual change.
export async function recordCaseActivity(tx, {
  caseId,
  userId,
  title,
  description = null,
  action,
  oldValue = null,
  newValue = null,
}) {
  await tx.timeline.create({
    data: {
      caseId,
      title,
      description,
      eventDate: new Date(),
      createdBy: userId,
    },
  })

  await tx.activityLog.create({
    data: {
      caseId,
      userId,
      action,
      oldValue: oldValue !== null ? String(oldValue) : null,
      newValue: newValue !== null ? String(newValue) : null,
    },
  })
}
