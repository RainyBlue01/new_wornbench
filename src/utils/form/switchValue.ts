const TRUE_LIKE_VALUES = new Set(['true', '1', 'on', 'yes', 'y', '开', '开启'])
const FALSE_LIKE_VALUES = new Set(['false', '0', 'off', 'no', 'n', '关', '关闭'])

function toComparableValue(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : String(value).trim().toLowerCase()
}

function matchesConfiguredValue(rawValue: unknown, configuredValue: unknown, configuredLabel?: unknown) {
  if (Object.is(rawValue, configuredValue)) return true

  const rawComparable = toComparableValue(rawValue)
  if (rawComparable === toComparableValue(configuredValue)) return true

  return configuredLabel !== null
    && configuredLabel !== undefined
    && String(configuredLabel).trim() !== ''
    && rawComparable === toComparableValue(configuredLabel)
}

/**
 * 将接口中的开关值转换为组件配置的 checked/unchecked 值。
 * 兼容 boolean、0/1、字符串以及原始数据中的 { label, value } 结构。
 */
export function normalizeSwitchValue(value: unknown, props: Record<string, any> = {}) {
  const checkedValue = props['checked-value'] ?? true
  const uncheckedValue = props['unchecked-value'] ?? false
  const rawValue = value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value')
    ? (value as { value: unknown }).value
    : value

  if (rawValue === null || rawValue === undefined || rawValue === '') return rawValue
  if (matchesConfiguredValue(rawValue, checkedValue, props.on)) return checkedValue
  if (matchesConfiguredValue(rawValue, uncheckedValue, props.off)) return uncheckedValue

  const comparableValue = toComparableValue(rawValue)
  if (TRUE_LIKE_VALUES.has(comparableValue)) return checkedValue
  if (FALSE_LIKE_VALUES.has(comparableValue)) return uncheckedValue

  return rawValue
}
