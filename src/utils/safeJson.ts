export const safeJsonParse = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback
  try {
    return (JSON.parse(value) ?? fallback) as T
  } catch {
    return fallback
  }
}

export const safeJsonRecord = <T = unknown>(
  value: string | null | undefined,
): Record<string, T> => {
  const parsed = safeJsonParse<unknown>(value, {})
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? parsed as Record<string, T>
    : {}
}
