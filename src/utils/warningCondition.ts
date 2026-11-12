import dayjs from 'dayjs'

export interface WarningPlan {
  symbol: string
  value?: any
  color?: string
  format?: string
}

function isInArray(arr: any[], val: any): boolean {
  const testStr = ',' + arr.join(',') + ','
  return testStr.indexOf(',' + val + ',') !== -1
}

function isEmptyValue(value: any): boolean {
  if (value === null || value === undefined || value === '') return true
  if (value === 0) return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

function normalizeToArray(value: any): any[] {
  if (Array.isArray(value)) return value
  if (value === null || value === undefined || value === '') return []
  return [value]
}

function formatDateValue(val: any, format?: string): string {
  if (!val && val !== 0) return ''
  const fmt = format || 'YYYY-MM-DD HH:mm:ss'
  return dayjs(val).format(fmt)
}

function checkAuditTime(startTime: string, endTime: string, date: string): boolean {
  let startDate = new Date(startTime).getTime()
  let endDate = new Date(endTime).getTime()
  const nowDate = new Date(date).getTime()
  const swapped = startDate > endDate
  if (swapped) [startDate, endDate] = [endDate, startDate]
  if (nowDate > startDate && nowDate < endDate) {
    return swapped ? false : true
  }
  return swapped ? true : false
}

function matchInCondition(planValue: any[], value: any): boolean {
  if (Array.isArray(value)) {
    const items: boolean[] = planValue.map(v => isInArray(value, v))
    return isInArray(items, true)
  }
  return isInArray(planValue, value)
}

function matchNotInCondition(planValue: any[], value: any): boolean {
  if (Array.isArray(value)) {
    const items: boolean[] = planValue.map(v => isInArray(value, v))
    return !isInArray(items, true)
  }
  return !isInArray(planValue, value)
}

function matchAllLike(planValue: any[], value: any): boolean {
  if (!value) return false
  const inputArr = normalizeToArray(value)
  const items: boolean[] = planValue.map(v => isInArray(inputArr, v))
  return !isInArray(items, false)
}

function matchCollectEq(planValue: any[], value: any): boolean {
  if (!value) return false
  const inputArr = normalizeToArray(value)
  const items: boolean[] = inputArr.map(v => isInArray(planValue, v))
  return items.length > 0 ? !isInArray(items, false) : false
}

function matchDateCompare(symbol: string, value: any, planValue: any, format?: string): boolean {
  if (!value) return false
  const fmt = format || 'YYYY-MM-DD HH:mm:ss'
  const inputTs = dayjs(value).valueOf()
  const planTs = dayjs(planValue).valueOf()
  if (isNaN(inputTs) || isNaN(planTs)) return false

  if (symbol === 'EQ' || symbol === 'time.eq') {
    return formatDateValue(planValue, fmt) === formatDateValue(value, fmt)
  }
  if (symbol === 'NE' || symbol === 'time.ne') {
    return formatDateValue(planValue, fmt) !== formatDateValue(value, fmt)
  }
  if (symbol === 'GE' || symbol === 'time.ge') {
    return inputTs >= planTs
  }
  if (symbol === 'LE' || symbol === 'time.le') {
    return inputTs <= planTs
  }
  return false
}

function matchBetween(value: any, planValue: any[], format?: string): boolean {
  if (isEmptyValue(value) || !Array.isArray(planValue) || planValue.length < 2) return false

  if (format || (typeof planValue[0] === 'string' && isNaN(Number(planValue[0])))) {
    const config1 = formatDateValue(planValue[0], format)
    const config2 = formatDateValue(planValue[1], format)
    const input = formatDateValue(value, format)
    return checkAuditTime(config1, config2, input)
  }

  const numValue = Number(value)
  return (
    !isNaN(numValue) &&
    !isNaN(Number(planValue[0])) &&
    !isNaN(Number(planValue[1])) &&
    Number(planValue[0]) <= numValue &&
    Number(planValue[1]) >= numValue
  )
}

export function checkWarningCondition(value: any, plan: WarningPlan): boolean {
  const symbol = plan.symbol

  if (symbol === 'isNull' || symbol === 'IS_NULL') {
    return isEmptyValue(value)
  }

  if (symbol === 'isNotNull' || symbol === 'NOT_NULL') {
    return !isEmptyValue(value)
  }

  if (symbol === '==' || symbol === '=' || symbol === 'EQ') {
    if (plan.format) {
      return matchDateCompare('EQ', value, plan.value, plan.format)
    }
    if (Array.isArray(value) && !Array.isArray(plan.value)) {
      return matchCollectEq(normalizeToArray(plan.value), value)
    }
    return plan.value == value
  }

  if (symbol === '!=' || symbol === '<>' || symbol === 'NE') {
    if (plan.format) {
      return matchDateCompare('NE', value, plan.value, plan.format)
    }
    return plan.value != value
  }

  if (symbol === '>' || symbol === 'GT') {
    return Number(value) > Number(plan.value)
  }

  if (symbol === '<' || symbol === 'LT') {
    return Number(value) < Number(plan.value)
  }

  if (symbol === '<=' || symbol === 'LE') {
    if (plan.format || (plan.value && isNaN(Number(plan.value)))) {
      return matchDateCompare('LE', value, plan.value, plan.format)
    }
    return Number(value) <= Number(plan.value)
  }

  if (symbol === '>=' || symbol === 'GE') {
    if (plan.format || (plan.value && isNaN(Number(plan.value)))) {
      return matchDateCompare('GE', value, plan.value, plan.format)
    }
    return Number(value) >= Number(plan.value)
  }

  if (symbol === 'time.eq') {
    return matchDateCompare('EQ', value, plan.value, plan.format)
  }

  if (symbol === 'time.ne') {
    return matchDateCompare('NE', value, plan.value, plan.format)
  }

  if (symbol === 'time.ge') {
    return matchDateCompare('GE', value, plan.value, plan.format)
  }

  if (symbol === 'time.le') {
    return matchDateCompare('LE', value, plan.value, plan.format)
  }

  if (symbol === 'string.contains' || symbol === 'LIKE') {
    if (!value) return false
    const valueStr = String(value)
    const planValueStr = String(plan.value)
    return valueStr.indexOf(planValueStr) !== -1 || planValueStr.indexOf(valueStr) !== -1
  }

  if (symbol === '!string.contains' || symbol === 'NOT_LIKE') {
    if (!value) return false
    const valueStr = String(value)
    const planValueStr = String(plan.value)
    return !(valueStr.indexOf(planValueStr) !== -1 || planValueStr.indexOf(valueStr) !== -1)
  }

  if (symbol === 'in' || symbol === 'include' || symbol === 'IN' || symbol === 'collect.one') {
    if (Array.isArray(plan.value)) {
      return matchInCondition(plan.value, value)
    }
    return false
  }

  if (symbol === 'notIn' || symbol === '!include' || symbol === 'NOT_IN') {
    if (Array.isArray(plan.value)) {
      return matchNotInCondition(plan.value, value)
    }
    return false
  }

  if (symbol === 'ALL_LIKE' || symbol === 'collect.all') {
    if (Array.isArray(plan.value)) {
      return matchAllLike(plan.value, value)
    }
    return false
  }

  if (symbol === 'collect.eq') {
    if (Array.isArray(plan.value)) {
      return matchCollectEq(plan.value, value)
    }
    return false
  }

  if (symbol === 'collect.ne') {
    if (Array.isArray(plan.value) && value) {
      const inputArr = normalizeToArray(value)
      const items: boolean[] = plan.value.map(v => isInArray(inputArr, v))
      return isInArray(items, false)
    }
    return false
  }

  if (symbol === 'number.rang' || symbol === 'BETWEEN' || symbol === 'time.rang') {
    return matchBetween(value, plan.value, plan.format)
  }

  return false
}

export function getWarningColor(value: any, plans?: WarningPlan[]): string | undefined {
  if (!plans || !Array.isArray(plans) || plans.length === 0) return undefined
  for (const plan of plans) {
    if (checkWarningCondition(value, plan)) {
      return plan.color
    }
  }
  return undefined
}
