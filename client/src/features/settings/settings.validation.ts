export function validateProfileName(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) {
    return "Full name is required"
  }
  if (trimmed.length < 2) {
    return "Name must be at least 2 characters"
  }
  return null
}
