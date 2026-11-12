/**
 * Extracts the display value returned by report APIs.
 * A present formatValue is authoritative, including when it is null or empty.
 */
export function getReportDetailDisplayValue(value: unknown): unknown {
  if (value === null || value === undefined || value === '') return ''

  if (typeof value === 'object' && !Array.isArray(value)) {
    const wrappedValue = value as Record<string, unknown>
    if (Object.prototype.hasOwnProperty.call(wrappedValue, 'formatValue')) {
      return wrappedValue.formatValue ?? ''
    }
  }

  return value
}
