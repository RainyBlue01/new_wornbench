export type ReportColumnWidthMap = Record<string, number>

const MIN_COLUMN_WIDTH = 40

const getValidWidth = (width: number | undefined) => {
  if (!Number.isFinite(width) || Number(width) <= 0) return undefined
  return Math.max(MIN_COLUMN_WIDTH, Math.round(Number(width)))
}

export const applyReportColumnWidths = (fields: any[], widths: ReportColumnWidthMap) => {
  if (!Array.isArray(fields)) return []

  return fields.map((field: any) => {
    const nextField = { ...field }
    const fieldKey = field.column || field.id
    const fieldWidth = getValidWidth(widths[fieldKey])

    if (fieldWidth !== undefined) {
      nextField.width = fieldWidth
    }

    if (!field.extra || typeof field.extra !== 'object') {
      return nextField
    }

    const nextExtra = { ...field.extra }

    if (Array.isArray(field.extra.children)) {
      nextExtra.children = field.extra.children.map((child: any) => {
        const childKey = child.column || child.id
        const childWidth = getValidWidth(widths[`${fieldKey}.${childKey}`])
        return childWidth === undefined ? { ...child } : { ...child, width: childWidth }
      })
    }

    if (field.nodeInfo) {
      const nodeKeys = ['operator', 'status', 'duration']
      nodeKeys.forEach((key) => {
        const nodeWidth = getValidWidth(widths[`${fieldKey}.${key}`])
        if (nodeWidth !== undefined) {
          nextExtra[key] = { ...(field.extra[key] || {}), width: nodeWidth }
        }
      })
    }

    nextField.extra = nextExtra
    return nextField
  })
}
