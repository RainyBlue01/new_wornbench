import dayjs from 'dayjs'

function formatDisplayTime(value: any, format = 'HH:mm:ss') {
  if (value === '' || value === null || value === undefined) return value
  if (dayjs.isDayjs(value) || value instanceof Date) return dayjs(value).format(format)

  const time = String(value).trim()
  const formatParts = format.match(/HH|mm|ss/g) || ['HH', 'mm', 'ss']
  const timeMatch = time.match(/(?:^|\s)(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?$/)

  if (timeMatch) {
    const completedTime: Record<string, string> = {
      HH: timeMatch[1].padStart(2, '0'),
      mm: (timeMatch[2] || '00').padStart(2, '0'),
      ss: (timeMatch[3] || '00').padStart(2, '0'),
    }
    return formatParts.map(part => completedTime[part]).join(':')
  }

  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format(format) : value
}

function formatSubmitTime(value: any, format = 'HH:mm:ss') {
  if (value === '' || value === null || value === undefined) return value
  if (dayjs.isDayjs(value) || value instanceof Date) return dayjs(value).format('HH:mm:ss')

  const time = String(value).trim()
  const formatParts = format.match(/HH|mm|ss/g) || ['HH', 'mm', 'ss']
  const valueParts = time.split(':')

  if (valueParts.length === formatParts.length && valueParts.every(part => /^\d{1,2}$/.test(part))) {
    const completedTime: Record<string, string> = { HH: '00', mm: '00', ss: '00' }
    formatParts.forEach((part, index) => {
      completedTime[part] = valueParts[index].padStart(2, '0')
    })
    return `${completedTime.HH}:${completedTime.mm}:${completedTime.ss}`
  }

  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('HH:mm:ss') : value
}

function formatSubmitTimeInterval(value: any, format = 'HH:mm:ss') {
  if (!value || typeof value !== 'object') return value
  return {
    ...value,
    start: formatSubmitTime(value.start, format),
    end: formatSubmitTime(value.end, format),
  }
}

function normalizeDateFormat(format: string) {
  return format.replace(/yyyy/g, 'YYYY').replace(/dd/g, 'DD')
}

function getValueFormat(props: any, fallback: string) {
  return normalizeDateFormat(props?.['value-format'] || props?.valueFormat || props?.format || fallback)
}

function formatDisplayDateTime(value: any, props: any) {
  if (value === '' || value === null || value === undefined) return value

  const valueFormat = getValueFormat(props, 'YYYY-MM-DD HH:mm:ss')
  const parsed = dayjs(value)
  if (parsed.isValid()) return parsed.format(valueFormat)

  const text = String(value).trim()
  const dateMatch = text.match(/^(\d{4})[-/.](\d{1,2})(?:[-/.](\d{1,2}))?/)
  if (!dateMatch) return value

  const completedDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${(dateMatch[3] || '01').padStart(2, '0')}`
  const timeMatch = text.match(/(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?\s*$/)
  const completedTime = timeMatch && timeMatch.index !== 0
    ? `${timeMatch[1].padStart(2, '0')}:${(timeMatch[2] || '00').padStart(2, '0')}:${(timeMatch[3] || '00').padStart(2, '0')}`
    : '00:00:00'
  const completed = dayjs(`${completedDate} ${completedTime}`)
  return completed.isValid() ? completed.format(valueFormat) : value
}
const formatList = [
  {
    label: "yyyy",
    value: "YYYY",
  },
  {
    label: "MM-dd",
    value: "MM-DD",
  },
  {
    label: "yyyy-MM",
    value: "YYYY-MM",
  },
  {
    label: "yyyy-MM-dd",
    value: "YYYY-MM-DD",
  },
  {
    label: "yyyy-MM-dd HH:mm",
    value: "YYYY-MM-DD HH:mm",
  },
  {
    label: "yyyy-MM-dd HH:mm:ss",
    value: "YYYY-MM-DD HH:mm:ss",
  },
  {
    label: "MM.dd",
    value: "MM.DD",
  },
  {
    label: "yyyy.MM",
    value: "YYYY.MM",
  },
  {
    label: "yyyy.MM.dd",
    value: "YYYY.MM.DD",
  },
  {
    label: "yyyy.MM.dd HH:mm",
    value: "YYYY.MM.DD HH:mm",
  },
  {
    label: "yyyy.MM.dd HH:mm:ss",
    value: "YYYY.MM.DD HH:mm:ss",
  },
];
export function setFormat(format: any) {
  const backendFormat = toBackendDateFormat(format)
  return backendFormat !== format ? backendFormat : toFrontendDateFormat(format)
}

export function toBackendDateFormat(format: any) {
  const matched = formatList.find((item) => item.value === format)
  return matched?.label ?? format
}

export function toFrontendDateFormat(format: any) {
  const matched = formatList.find((item) => item.label === format)
  return matched?.value ?? format
}

export function toBackendFormDateFormats(formData: any) {
  const normalized = JSON.parse(JSON.stringify(formData || {}))
  const walk = (fields: any[]) => {
    if (!Array.isArray(fields)) return
    fields.forEach((field: any) => {
      if ((field?.type === 'DATE' || field?.type === 'DATE_INTERVAL') && field?.props?.format) {
        field.props.format = toBackendDateFormat(field.props.format)
      }
      walk(field?.children)
      if (Array.isArray(field?.list)) {
        field.list.forEach((row: any[]) => walk(row))
      }
    })
  }
  walk(normalized.formList)
  return normalized
}

export { formatDisplayTime, formatSubmitTime, formatSubmitTimeInterval, getValueFormat, formatDisplayDateTime }
