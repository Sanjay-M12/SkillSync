/**
 * Calculates a rounded percentage safely handling zero denominators.
 */
export function calculateProgress(completed: number, total: number): number {
  if (!total || total <= 0) {
    return 0
  }
  const ratio = (completed / total) * 100
  return Math.min(100, Math.max(0, Math.round(ratio)))
}

/**
 * Calculates hours from minutes with one decimal point.
 */
export function minutesToHours(minutes: number): number {
  if (!minutes || minutes <= 0) {
    return 0
  }
  return Math.round((minutes / 60) * 10) / 10
}
