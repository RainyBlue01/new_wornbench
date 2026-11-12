export type ReportFieldFormatKind = 'number' | 'dateTime' | 'address'

interface ReportField {
  type?: string
  format?: Record<string, unknown>
}

const NUMBER_TYPES = new Set(['NUMBER', 'DOUBLE', 'RATE', 'MONEY'])
const DATE_TIME_TYPES = new Set(['DATE', 'DATETIME'])
const ADDRESS_TYPES = new Set(['ADDRESS'])

const hasOwnFormat = (format: ReportField['format'], key: ReportFieldFormatKind) =>
  !!format && Object.prototype.hasOwnProperty.call(format, key)

export const isReportNumberFieldType = (type?: string) =>
  NUMBER_TYPES.has(String(type || '').toUpperCase())

export const getReportFieldFormatKind = (field?: ReportField): ReportFieldFormatKind | null => {
  const type = String(field?.type || '').toUpperCase()

  if (isReportNumberFieldType(type)) return 'number'
  if (DATE_TIME_TYPES.has(type)) return 'dateTime'
  if (ADDRESS_TYPES.has(type)) return 'address'
  if (type === 'TIME') return null

  if (hasOwnFormat(field?.format, 'number')) return 'number'
  if (hasOwnFormat(field?.format, 'dateTime')) return 'dateTime'
  if (hasOwnFormat(field?.format, 'address')) return 'address'

  return null
}
