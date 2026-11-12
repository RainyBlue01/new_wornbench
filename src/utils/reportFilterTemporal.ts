export const SYSTEM_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

const SYSTEM_DATE_TIME_FIELDS = new Set(['create_time', 'update_time'])

export type ReportFilterTemporalConfig = {
  format: string
  valueFormat: string
  showTime: boolean
  mode: 'date' | 'year' | 'month'
}

export function normalizeReportFilterFormat(format: unknown): string {
  if (typeof format !== 'string') return ''
  return format
    .trim()
    .replace(/yyyy/g, 'YYYY')
    .replace(/dd/g, 'DD')
}

function getFieldName(field: any): string {
  return String(field?.column || field?.fieldName || field?.field || field?.id || '')
}

function getConfiguredFormat(field: any): string {
  const candidates = [
    field?.props?.format,
    field?.props?.['value-format'],
    field?.props?.valueFormat,
    typeof field?.format === 'string' ? field.format : '',
    field?.extra?.format,
  ]
  return normalizeReportFilterFormat(candidates.find(value => typeof value === 'string' && value.trim()))
}

export function resolveReportFilterTemporalConfig(field: any): ReportFilterTemporalConfig {
  const fieldName = getFieldName(field)
  const fieldType = String(field?.type || field?.inputType || field?.componentType || '').toUpperCase()
  const isSystemDateTime = SYSTEM_DATE_TIME_FIELDS.has(fieldName)
  const fallback = fieldType === 'TIME' ? 'HH:mm:ss' : 'YYYY-MM-DD'
  const format = isSystemDateTime ? SYSTEM_DATE_TIME_FORMAT : (getConfiguredFormat(field) || fallback)

  return {
    format,
    valueFormat: format,
    showTime: fieldType !== 'TIME' && /HH|mm|ss/.test(format),
    mode: format === 'YYYY'
      ? 'year'
      : (format === 'YYYY-MM' || format === 'YYYY.MM' ? 'month' : 'date'),
  }
}
