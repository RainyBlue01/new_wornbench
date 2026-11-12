export const APP_CATEGORY_LIST = [
  { label: '普通表单', value: 1 },
  { label: '流程表单', value: 2 },
  { label: '简单报表', value: 3 },
] as const

export const getAppCategoryLabel = (category?: number) =>
  APP_CATEGORY_LIST.find((item) => item.value === category)?.label ?? ''

export const getAppCategoryClass = (category?: number) => {
  const classMap: Record<number, string> = {
    1: 'type-form',
    2: 'type-flow',
    3: 'type-report',
  }
  return classMap[category ?? 0] ?? ''
}
