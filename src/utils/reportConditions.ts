import dayjs from 'dayjs'

interface ReportCondition {
  id?: string
  field?: string
  column?: string
  fieldName?: string
  type?: string
  symbol?: string
  condition?: string
  value?: any
  extra?: Record<string, any>
  format?: any
  label?: string
  showLabel?: string
}

const dateFormats = [
  'YYYY/MM/DD HH:mm:ss', 'YYYY/MM/DD', 'YYYY-MM-DD HH:mm:ss',
  'YYYY-MM-DD', 'YYYY年MM月DD日 HH:mm:ss', 'YYYY年MM月DD日 dddd',
  'YYYY年MM月', 'MM月DD日', 'dddd',
]

const fieldId = (field: ReportCondition) => field.field || field.id || field.column

export function emptyReportConditionValue(symbol: string, inputType: string): null | string | any[] {
  if (['IS_NULL', 'NOT_NULL', 'IS_NOT_NULL'].includes(symbol)) return null
  if (['IN', 'NOT_IN', 'BETWEEN'].includes(symbol) ||
      ['SELECT_MULTIPLE', 'CHECKBOX', 'USER_MULTIPLE', 'DEPT_MULTIPLE', 'ADDRESS', 'LOCATION'].includes(inputType)) {
    return []
  }
  return ''
}

// 只更新当前字段，保留其他运行时筛选条件；不修改报表设计配置。
export function mergeReportCondition(
  conditions: ReportCondition[],
  params: ReportCondition,
  selectFields: ReportCondition[] = [],
): ReportCondition[] {
  const id = fieldId(params)
  const symbol = params.symbol === 'NOT_NULL' ? 'IS_NOT_NULL' : params.symbol
  const next = conditions.filter(condition => fieldId(condition) !== id)
  const empty = (value: any) => value === null || value === undefined || value === ''
  if (!['IS_NULL', 'IS_NOT_NULL'].includes(symbol || '') &&
      (empty(params.value) || (Array.isArray(params.value) &&
        (params.value.length === 0 || params.value.some(empty))))) return next

  const field = selectFields.find(item => fieldId(item) === id)
  let value = params.value
  const extra = { ...params.extra }
  if (['DATE', 'DATETIME'].includes(field?.type || params.type || '')) {
    const config = field?.format ?? params.extra?.format
    const dateType = typeof config?.dateTime === 'number' ? config.dateTime : config?.dateTime?.type
    const format = typeof config === 'string' ? config : dateFormats[dateType]
    if (format) {
      extra.format = format
      // 表单格式可能使用 Java 风格的年/日占位符。
      const pattern = format.includes('yyyy') ? format.replace(/yyyy/g, 'YYYY').replace(/dd/g, 'DD') : format
      const formatValue = (item: any) => {
        if (empty(item)) return item
        const date = dayjs(item)
        if (!date.isValid()) return item
        // 按展示格式保留精度，再补齐后端需要的完整日期时间。
        // 星期展示仍使用所选日期，不能只凭星期反推出唯一日期。
        const weekdayOnly = pattern === 'dddd'
        const year = pattern.includes('Y') ? date.year() : dayjs().year()
        const month = pattern.includes('M') || weekdayOnly ? date.month() : 0
        const day = pattern.includes('D') || weekdayOnly ? date.date() : 1
        return date.date(1).year(year).month(month).date(day)
          .hour(pattern.includes('H') || pattern.includes('h') ? date.hour() : 0)
          .minute(pattern.includes('m') ? date.minute() : 0)
          .second(pattern.includes('s') ? date.second() : 0)
          .format('YYYY-MM-DD HH:mm:ss')
      }
      if (symbol !== 'DYNAMIC_BETWEEN') {
        value = Array.isArray(value) ? value.map(formatValue) : formatValue(value)
      }
    }
  }
  next.push({
    field: id, id, symbol, condition: symbol, value, extra,
    showLabel: params.showLabel || params.label,
    column: params.column || params.fieldName || id,
    type: params.type,
  })
  return next
}
