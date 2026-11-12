/** 附件/图片类字段类型 */
export function isFileFieldType(type?: string) {
  return type === 'ATTACH' || type === 'ATTACHMENT' || type === 'PICTURE'
}

/** 将附件/图片字段值统一解析为文件列表 */
export function parseFileFieldValue(val: unknown): Array<Record<string, any>> {
  if (val == null || val === '' || val === '[]') return []
  if (Array.isArray(val)) return val.filter(Boolean) as Array<Record<string, any>>
  if (typeof val === 'object') return [val as Record<string, any>]
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) return parsed.filter(Boolean)
      if (parsed && typeof parsed === 'object') return [parsed]
    } catch {
      return []
    }
  }
  return []
}
