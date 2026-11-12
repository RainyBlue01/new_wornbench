const TRUE_LIKE_VALUES = new Set(['true', '1', 'on', 'yes', 'y', '开', '开启'])
const FALSE_LIKE_VALUES = new Set(['false', '0', 'off', 'no', 'n', '关', '关闭'])

function toComparableValue(value: unknown) {
  return String(value ?? '').trim().toLowerCase()
}

function valuesMatch(left: unknown, right: unknown) {
  return Object.is(left, right) || toComparableValue(left) === toComparableValue(right)
}

function getOptionValue(option: any) {
  return option?.value ?? option?.id ?? option?.code
}

function getOptionLabel(option: any) {
  return option?.label ?? option?.nickname ?? option?.name ?? option?.title ?? getOptionValue(option)
}

function getSwitchFallbackLabel(value: unknown) {
  const comparableValue = toComparableValue(value)
  if (TRUE_LIKE_VALUES.has(comparableValue)) return '开启'
  if (FALSE_LIKE_VALUES.has(comparableValue)) return '关闭'
  return ''
}

function formatRawValue(value: unknown) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    const dynamicValue = value as { type?: string; num?: unknown }
    if (dynamicValue.type && dynamicValue.num !== undefined) {
      const unitMap: Record<string, string> = { DAY: '天', MONTH: '个月', YEAR: '年' }
      return `${dynamicValue.num}${unitMap[dynamicValue.type] || ''}`
    }
    return JSON.stringify(value)
  }
  return String(value)
}

export function buildSwitchDisplayOptions(props: Record<string, any> = {}) {
  return [
    {
      label: props.on || '开启',
      value: props['checked-value'] ?? true,
    },
    {
      label: props.off || '关闭',
      value: props['unchecked-value'] ?? false,
    },
  ]
}

/**
 * 仅格式化流程条件节点的展示值，不改变提交给流程引擎的原始值。
 */
export function formatFlowConditionValue(rule: any) {
  const options = Array.isArray(rule?.default) ? rule.default : []
  const values = Array.isArray(rule?.value) ? rule.value : [rule?.value]

  return values.map((value) => {
    const matchedOption = options.find((option: any) => valuesMatch(getOptionValue(option), value))
    if (matchedOption) return formatRawValue(getOptionLabel(matchedOption))

    if (rule?.inputType === 'SWITCH') {
      return getSwitchFallbackLabel(value) || formatRawValue(value)
    }

    return formatRawValue(value)
  }).filter(Boolean).join(',')
}
