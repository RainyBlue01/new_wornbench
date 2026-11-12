/** 仅转换集合规则的请求值，不修改表单中的原始数组。 */
export function serializeFormConditionValue(symbol: string | undefined, value: any): any {
  return (symbol === 'IN' || symbol === 'NOT_IN') && Array.isArray(value)
    ? value.join(',')
    : value
}

/** 编辑和前端判断时恢复集合，兼容旧数组和后台保存的逗号字符串。 */
export function restoreFormConditionValue(symbol: string | undefined, value: any, options: any[] = []): any {
  if ((symbol !== 'IN' && symbol !== 'NOT_IN') || typeof value !== 'string') return value
  if (value === '') return []
  return value.split(',').map(part => {
    const option = Array.isArray(options) ? options.find(item => String(item.value) === part) : undefined
    return option ? option.value : part
  })
}

/** 在设计保存边界统一转换，覆盖未重新编辑的旧规则及流程页面保存。 */
export function serializeFormDesignLogicValues(data: any): any {
  if (typeof data?.formConfig !== 'string') return data
  let config: any
  try {
    config = JSON.parse(data.formConfig)
  } catch {
    return data
  }
  if (!Array.isArray(config?.formLogics)) return data
  config.formLogics.forEach((rule: any) => {
    if (!Array.isArray(rule?.logicConditions)) return
    rule.logicConditions.forEach((condition: any) => {
      if (condition) condition.value = serializeFormConditionValue(condition.condition, condition.value)
    })
  })
  return { ...data, formConfig: JSON.stringify(config) }
}
